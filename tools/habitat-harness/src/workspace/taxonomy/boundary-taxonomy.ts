import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  habitatArtifactsProjectName,
  habitatArtifactsRoot,
} from "@internal/habitat-harness/substrate/lib/artifact-paths";
import { repoRoot } from "@internal/habitat-harness/substrate/lib/paths";
import { createProjectGraphAsync } from "@nx/devkit";
import type { NxProjectMetadata } from "./nx-projects.js";

export interface TaxonomyProject {
  name: string;
  root: string;
  tags: string[];
}

export interface TaxonomyConstraint {
  sourceTag: string;
  onlyDependOnLibsWithTags: string[];
}

export interface ParsedBoundaryTaxonomy {
  projects: TaxonomyProject[];
  constraints: TaxonomyConstraint[];
}

export interface WorkspaceManifestProject {
  name: string;
  root: string;
  tags: string[];
}

export interface BoundaryGraphEdge {
  source: string;
  target: string;
  type?: string;
}

export type BoundaryTaxonomyIssueReason =
  | "duplicate-taxonomy-project"
  | "duplicate-taxonomy-root"
  | "missing-taxonomy-project-for-manifest"
  | "missing-taxonomy-project-for-nx"
  | "missing-manifest"
  | "manifest-name-mismatch"
  | "manifest-tag-mismatch"
  | "missing-nx-project"
  | "nx-root-mismatch"
  | "nx-tag-mismatch"
  | "config-constraint-mismatch";

export interface BoundaryTaxonomyIssue {
  reason: BoundaryTaxonomyIssueReason;
  message: string;
  project?: string;
  root?: string;
  source?: string;
  target?: string;
}

export interface BoundaryTaxonomyNote {
  reason:
    | "workspace-root-not-nx-project"
    | "nx-inferred-artifact-project"
    | "nx-inferred-habitat-internal-project";
  message: string;
  project: string;
  root: string;
}

export interface BoundaryTaxonomyAudit {
  ok: boolean;
  issues: BoundaryTaxonomyIssue[];
  notes: BoundaryTaxonomyNote[];
  projectCount: number;
  nxProjectCount: number;
  graphEdgeCount: number;
}

export function parseBoundaryTaxonomy(markdown: string): ParsedBoundaryTaxonomy {
  return {
    projects: parseProjectAssignments(markdown),
    constraints: parseDependencyConstraints(markdown),
  };
}

export async function readWorkspaceManifestProjects(
  root = repoRoot
): Promise<WorkspaceManifestProject[]> {
  const rootPackagePath = path.join(root, "package.json");
  const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, "utf8")) as {
    name?: string;
    workspaces?: string[];
    nx?: { tags?: string[] };
  };
  const workspacePatterns = rootPackage.workspaces ?? [];
  const manifestRoots = new Set<string>(["."]);
  for (const pattern of workspacePatterns) {
    for (const workspaceRoot of await expandSimpleWorkspacePattern(root, pattern)) {
      manifestRoots.add(workspaceRoot);
    }
  }

  const projects: WorkspaceManifestProject[] = [];
  for (const manifestRoot of [...manifestRoots].sort()) {
    const manifestPath = path.join(root, manifestRoot, "package.json");
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as {
      name?: string;
      nx?: { tags?: string[] };
    };
    if (!manifest.name) continue;
    const projectJsonTags = await readProjectJsonTags(root, manifestRoot);
    projects.push({
      name: manifest.name,
      root: normalizeRepoPath(manifestRoot),
      tags: boundaryTags([...(manifest.nx?.tags ?? []), ...projectJsonTags]),
    });
  }
  return projects.sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
}

export async function readBoundaryConfigConstraints(
  configPath = path.join(repoRoot, "eslint.boundaries.config.mjs")
): Promise<TaxonomyConstraint[]> {
  const imported = (await import(pathToFileURL(configPath).href)) as { default?: unknown };
  return extractBoundaryConfigConstraints(imported.default);
}

export function extractBoundaryConfigConstraints(config: unknown): TaxonomyConstraint[] {
  const configs = Array.isArray(config) ? config : [];
  const constraints: TaxonomyConstraint[] = [];
  for (const item of configs) {
    if (!isRecord(item)) continue;
    const rules = item.rules;
    if (!isRecord(rules)) continue;
    const ruleConfig = rules["@nx/enforce-module-boundaries"];
    if (!Array.isArray(ruleConfig)) continue;
    const options = ruleConfig[1];
    if (!isRecord(options) || !Array.isArray(options.depConstraints)) continue;
    for (const depConstraint of options.depConstraints) {
      if (!isRecord(depConstraint)) continue;
      if (typeof depConstraint.sourceTag !== "string") continue;
      if (!Array.isArray(depConstraint.onlyDependOnLibsWithTags)) continue;
      constraints.push({
        sourceTag: depConstraint.sourceTag,
        onlyDependOnLibsWithTags: sortedUnique(
          depConstraint.onlyDependOnLibsWithTags.filter(
            (tag): tag is string => typeof tag === "string"
          )
        ),
      });
    }
  }
  return uniqueConstraints(constraints);
}

export async function readNxProjectMetadataFromGraph(): Promise<{
  projects: NxProjectMetadata[];
  graphEdges: BoundaryGraphEdge[];
}> {
  const graph = await createProjectGraphAsync();
  const projects = Object.entries(graph.nodes)
    .filter(([, node]) => node.type === "app" || node.type === "lib")
    .map(([name, node]) => {
      const data = node.data;
      return {
        name,
        root: normalizeRepoPath(data.root),
        sourceRoot: data.sourceRoot ? normalizeRepoPath(data.sourceRoot) : null,
        tags: boundaryTags(data.tags ?? []),
        targets: Object.keys(data.targets ?? {})
          .sort()
          .map((targetName) => ({ name: targetName })),
      } satisfies NxProjectMetadata;
    })
    .sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));

  const workspaceProjectNames = new Set(projects.map((project) => project.name));
  const graphEdges = Object.entries(graph.dependencies)
    .flatMap(([source, deps]) =>
      deps
        .filter((dep) => workspaceProjectNames.has(source) && workspaceProjectNames.has(dep.target))
        .map((dep) => ({ source, target: dep.target, type: dep.type }))
    )
    .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));

  return { projects, graphEdges };
}

async function readProjectJsonTags(root: string, projectRoot: string): Promise<string[]> {
  try {
    const projectConfig = JSON.parse(
      await fs.readFile(path.join(root, projectRoot, "project.json"), "utf8")
    ) as { tags?: string[] };
    return projectConfig.tags ?? [];
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

export function auditBoundaryTaxonomy(input: {
  taxonomy: ParsedBoundaryTaxonomy;
  manifests: readonly WorkspaceManifestProject[];
  nxProjects: readonly NxProjectMetadata[];
  configConstraints: readonly TaxonomyConstraint[];
  graphEdges: readonly BoundaryGraphEdge[];
}): BoundaryTaxonomyAudit {
  const issues: BoundaryTaxonomyIssue[] = [];
  const notes: BoundaryTaxonomyNote[] = [];
  const taxonomyByName = new Map<string, TaxonomyProject>();
  const taxonomyByRoot = new Map<string, TaxonomyProject>();
  const manifestByRoot = new Map(input.manifests.map((project) => [project.root, project]));
  const taxonomyNxProjects = input.taxonomy.projects.filter((project) => project.root !== ".");
  const taxonomyNxByName = new Map(taxonomyNxProjects.map((project) => [project.name, project]));
  const nxByName = new Map(input.nxProjects.map((project) => [project.name, project]));

  for (const project of input.taxonomy.projects) {
    if (taxonomyByName.has(project.name)) {
      issues.push({
        reason: "duplicate-taxonomy-project",
        message: `Taxonomy lists project ${project.name} more than once.`,
        project: project.name,
      });
    }
    if (taxonomyByRoot.has(project.root)) {
      issues.push({
        reason: "duplicate-taxonomy-root",
        message: `Taxonomy lists root ${project.root} more than once.`,
        root: project.root,
      });
    }
    taxonomyByName.set(project.name, project);
    taxonomyByRoot.set(project.root, project);
  }

  for (const manifest of input.manifests) {
    if (!taxonomyByRoot.has(manifest.root)) {
      issues.push({
        reason: "missing-taxonomy-project-for-manifest",
        message: `Workspace manifest ${manifest.name} at ${manifest.root} is missing from taxonomy.md.`,
        project: manifest.name,
        root: manifest.root,
      });
    }
  }

  for (const nxProject of input.nxProjects) {
    if (!taxonomyNxByName.has(nxProject.name)) {
      issues.push({
        reason: "missing-taxonomy-project-for-nx",
        message: `Resolved Nx project ${nxProject.name} is missing from taxonomy.md.`,
        project: nxProject.name,
        root: nxProject.root,
      });
    }
  }

  for (const taxonomyProject of input.taxonomy.projects) {
    const manifest = manifestByRoot.get(taxonomyProject.root);
    if (!manifest) {
      if (
        !isNxInferredArtifactProject(taxonomyProject) &&
        !isNxInferredHabitatInternalProject(taxonomyProject)
      ) {
        issues.push({
          reason: "missing-manifest",
          message: `Taxonomy project ${taxonomyProject.name} at ${taxonomyProject.root} has no package.json manifest.`,
          project: taxonomyProject.name,
          root: taxonomyProject.root,
        });
        continue;
      }
      notes.push({
        reason: isNxInferredArtifactProject(taxonomyProject)
          ? "nx-inferred-artifact-project"
          : "nx-inferred-habitat-internal-project",
        message: isNxInferredArtifactProject(taxonomyProject)
          ? "The Habitat artifact root is an inferred Nx project-plane node, not a package manifest workspace."
          : "The Habitat internal root is an inferred Nx project-plane node, not a package manifest workspace.",
        project: taxonomyProject.name,
        root: taxonomyProject.root,
      });
    } else if (manifest.name !== taxonomyProject.name) {
      issues.push({
        reason: "manifest-name-mismatch",
        message: `Manifest at ${taxonomyProject.root} is ${manifest.name}, but taxonomy lists ${taxonomyProject.name}.`,
        project: taxonomyProject.name,
        root: taxonomyProject.root,
      });
    } else if (taxonomyProject.root === ".") {
      notes.push({
        reason: "workspace-root-not-nx-project",
        message:
          "The repo root is taxonomy guidance for workspace orchestration, but it is not a resolved Nx project-plane node.",
        project: taxonomyProject.name,
        root: taxonomyProject.root,
      });
    } else if (!sameTags(manifest.tags, taxonomyProject.tags)) {
      issues.push({
        reason: "manifest-tag-mismatch",
        message: `Manifest tags for ${taxonomyProject.name} do not match taxonomy.md.`,
        project: taxonomyProject.name,
        root: taxonomyProject.root,
      });
    }

    if (taxonomyProject.root !== ".") {
      const nxProject = nxByName.get(taxonomyProject.name);
      if (!nxProject) {
        issues.push({
          reason: "missing-nx-project",
          message: `Taxonomy project ${taxonomyProject.name} is not a resolved Nx project.`,
          project: taxonomyProject.name,
          root: taxonomyProject.root,
        });
      } else {
        if (nxProject.root !== taxonomyProject.root) {
          issues.push({
            reason: "nx-root-mismatch",
            message: `Resolved Nx root for ${taxonomyProject.name} is ${nxProject.root}, expected ${taxonomyProject.root}.`,
            project: taxonomyProject.name,
            root: taxonomyProject.root,
          });
        }
        if (!sameTags(nxProject.tags, taxonomyProject.tags)) {
          issues.push({
            reason: "nx-tag-mismatch",
            message: `Resolved Nx tags for ${taxonomyProject.name} do not match taxonomy.md.`,
            project: taxonomyProject.name,
            root: taxonomyProject.root,
          });
        }
      }
    }
  }

  const taxonomyConstraints = canonicalConstraintMap(input.taxonomy.constraints);
  const configConstraints = canonicalConstraintMap(input.configConstraints);
  if (!sameConstraintMaps(taxonomyConstraints, configConstraints)) {
    issues.push({
      reason: "config-constraint-mismatch",
      message: "eslint.boundaries.config.mjs depConstraints do not match taxonomy.md.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
    notes,
    projectCount: input.taxonomy.projects.length,
    nxProjectCount: input.nxProjects.length,
    graphEdgeCount: input.graphEdges.length,
  };
}

export function firstFailedConstraint(
  sourceTags: readonly string[],
  targetTags: readonly string[],
  constraints: readonly TaxonomyConstraint[]
): TaxonomyConstraint | undefined {
  const targetTagSet = new Set(targetTags);
  return constraints.find(
    (constraint) =>
      sourceTags.includes(constraint.sourceTag) &&
      !constraint.onlyDependOnLibsWithTags.some((allowedTag) => targetTagSet.has(allowedTag))
  );
}

function parseProjectAssignments(markdown: string): TaxonomyProject[] {
  const rows = extractMarkdownTable(markdown, "## 2. Per-project assignment");
  return rows.map((row) => ({
    name: row[0].replace(/^\(new\)\s+/, "").trim(),
    root: stripCode(row[1]),
    tags: extractCodeValues(row[2]),
  }));
}

function parseDependencyConstraints(markdown: string): TaxonomyConstraint[] {
  const rows = extractMarkdownTable(markdown, "## 3. Dependency constraints");
  const sourceTags = rows.map((row) => extractCodeValues(row[0])[0] ?? row[0].trim());
  return rows.map((row) => ({
    sourceTag: extractCodeValues(row[0])[0] ?? row[0].trim(),
    onlyDependOnLibsWithTags: normalizeAllowedTags(row[1], sourceTags),
  }));
}

function normalizeAllowedTags(cell: string, sourceTags: readonly string[]): string[] {
  const codeValues = extractCodeValues(cell);
  if (!cell.toLowerCase().includes("everything except")) return sortedUnique(codeValues);
  const excluded = new Set(codeValues);
  return sortedUnique(sourceTags.filter((tag) => !excluded.has(tag)));
}

function extractMarkdownTable(markdown: string, heading: string): string[][] {
  const start = markdown.indexOf(heading);
  if (start === -1) return [];
  const rest = markdown.slice(start);
  const nextHeading = rest.slice(heading.length).search(/\n##\s+/);
  const section = nextHeading === -1 ? rest : rest.slice(0, heading.length + nextHeading);
  return section
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line.trim()))
    .slice(1)
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((row) => row.length >= 3);
}

function stripCode(value: string): string {
  const match = value.match(/`([^`]+)`/);
  return normalizeRepoPath(match?.[1] ?? value.trim());
}

function extractCodeValues(value: string): string[] {
  return [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

async function expandSimpleWorkspacePattern(root: string, pattern: string): Promise<string[]> {
  if (!pattern.endsWith("/*")) {
    throw new Error(`Unsupported workspace pattern ${pattern}`);
  }
  const parent = pattern.slice(0, -2);
  const parentPath = path.join(root, parent);
  const entries = await fs.readdir(parentPath, { withFileTypes: true });
  const roots: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workspaceRoot = normalizeRepoPath(path.join(parent, entry.name));
    try {
      await fs.access(path.join(root, workspaceRoot, "package.json"));
      roots.push(workspaceRoot);
    } catch {
      // Workspace globs may include non-package directories; ignore them.
    }
  }
  return roots;
}

function canonicalConstraintMap(constraints: readonly TaxonomyConstraint[]): Map<string, string> {
  return new Map(
    uniqueConstraints(constraints).map((constraint) => [
      constraint.sourceTag,
      sortedUnique(constraint.onlyDependOnLibsWithTags).join(","),
    ])
  );
}

function sameConstraintMaps(left: Map<string, string>, right: Map<string, string>): boolean {
  if (left.size !== right.size) return false;
  for (const [key, value] of left) {
    if (right.get(key) !== value) return false;
  }
  return true;
}

function uniqueConstraints(constraints: readonly TaxonomyConstraint[]): TaxonomyConstraint[] {
  const bySourceTag = new Map<string, TaxonomyConstraint>();
  for (const constraint of constraints) {
    bySourceTag.set(constraint.sourceTag, {
      sourceTag: constraint.sourceTag,
      onlyDependOnLibsWithTags: sortedUnique(constraint.onlyDependOnLibsWithTags),
    });
  }
  return [...bySourceTag.values()].sort((a, b) => a.sourceTag.localeCompare(b.sourceTag));
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function boundaryTags(values: readonly string[]): string[] {
  return sortedUnique(
    values.filter((tag) => tag.startsWith("kind:") || tag.startsWith("habitat:"))
  );
}

function sameTags(left: readonly string[], right: readonly string[]): boolean {
  return sortedUnique(left).join("\0") === sortedUnique(right).join("\0");
}

function isNxInferredArtifactProject(project: TaxonomyProject): boolean {
  return project.name === habitatArtifactsProjectName && project.root === habitatArtifactsRoot;
}

function isNxInferredHabitatInternalProject(project: TaxonomyProject): boolean {
  return (
    project.name.startsWith("@internal/habitat-harness-") &&
    project.root.startsWith("tools/habitat-harness/src/")
  );
}

function normalizeRepoPath(value: string): string {
  const normalized = value.replaceAll(path.sep, "/").replace(/\/+$/, "");
  return normalized === "" ? "." : normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
