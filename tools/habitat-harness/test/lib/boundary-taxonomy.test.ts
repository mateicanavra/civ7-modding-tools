import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  auditBoundaryTaxonomy,
  type BoundaryGraphEdge,
  extractBoundaryConfigConstraints,
  firstFailedConstraint,
  parseBoundaryTaxonomy,
  readWorkspaceManifestProjects,
  type TaxonomyConstraint,
} from "../../src/lib/boundary-taxonomy.js";
import type { NxProjectMetadata } from "../../src/lib/nx-projects.js";
import { repoRoot } from "../../src/lib/paths.js";

describe("boundary taxonomy verifier", () => {
  test("parses taxonomy project and constraint tables", async () => {
    const taxonomy = parseBoundaryTaxonomy(await readTaxonomyMarkdown());

    expect(taxonomy.projects).toContainEqual({
      name: "@internal/habitat-harness",
      root: "tools/habitat-harness",
      tags: ["kind:tooling"],
    });
    expect(taxonomy.projects).toContainEqual({
      name: "@internal/habitat-artifacts",
      root: ".habitat",
      tags: ["kind:tooling"],
    });
    expect(taxonomy.projects).toContainEqual({
      name: "mod-civ7-intelligence-bridge",
      root: "mods/mod-civ7-intelligence-bridge",
      tags: ["kind:mod", "kind:control"],
    });
    expect(taxonomy.constraints).toContainEqual({
      sourceTag: "kind:control",
      onlyDependOnLibsWithTags: ["kind:adapter", "kind:control", "kind:engine", "kind:foundation"],
    });
  });

  test("audits provided manifests, resolved Nx tags, config constraints, and graph edges", async () => {
    const taxonomy = parseBoundaryTaxonomy(await readTaxonomyMarkdown());
    const manifests = manifestBackedProjects(taxonomy.projects);

    const audit = auditBoundaryTaxonomy({
      taxonomy,
      manifests,
      nxProjects: fakeNxProjects(
        taxonomy.projects
          .filter((project) => project.root !== ".")
          .map((project) => [project.name, project.root, project.tags])
      ),
      configConstraints: taxonomy.constraints,
      graphEdges: [{ source: "@civ7/adapter", target: "@civ7/types" }],
    });

    expect(audit.ok).toBe(true);
    expect(audit.issues).toEqual([]);
    expect(audit.projectCount).toBe(26);
    expect(audit.nxProjectCount).toBe(25);
    expect(audit.graphEdgeCount).toBe(1);
    expect(audit.notes).toContainEqual({
      reason: "workspace-root-not-nx-project",
      message:
        "The repo root is taxonomy guidance for workspace orchestration, but it is not a resolved Nx project-plane node.",
      project: "civ7-modding-tools",
      root: ".",
    });
    expect(audit.notes).toContainEqual({
      reason: "nx-inferred-artifact-project",
      message:
        "The Habitat artifact root is an inferred Nx project-plane node, not a package manifest workspace.",
      project: "@internal/habitat-artifacts",
      root: ".habitat",
    });
  });

  test("uses all matching source tags so dual-tag control-to-sdk edges fail", async () => {
    const taxonomy = parseBoundaryTaxonomy(await readTaxonomyMarkdown());
    const sourceTags = ["kind:mod", "kind:control"];
    const sdkTags = ["kind:sdk"];

    const failed = firstFailedConstraint(sourceTags, sdkTags, taxonomy.constraints);

    expect(failed?.sourceTag).toBe("kind:control");
  });

  test("reports sentinel forbidden graph edges without touching source files", async () => {
    const taxonomy = parseBoundaryTaxonomy(await readTaxonomyMarkdown());
    const audit = auditBoundaryTaxonomy({
      taxonomy,
      manifests: manifestBackedProjects(taxonomy.projects),
      nxProjects: fakeNxProjects([
        ["@civ7/types", "packages/civ7-types", ["kind:foundation"]],
        ["@civ7/adapter", "packages/civ7-adapter", ["kind:adapter"]],
        ["@mateicanavra/civ7-sdk", "packages/sdk", ["kind:sdk"]],
        [
          "mod-civ7-intelligence-bridge",
          "mods/mod-civ7-intelligence-bridge",
          ["kind:mod", "kind:control"],
        ],
      ]),
      configConstraints: taxonomy.constraints,
      graphEdges: [
        { source: "@civ7/types", target: "@civ7/adapter" },
        { source: "mod-civ7-intelligence-bridge", target: "@mateicanavra/civ7-sdk" },
      ],
    });

    expect(audit.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "illegal-graph-edge",
          source: "@civ7/types",
          target: "@civ7/adapter",
        }),
        expect.objectContaining({
          reason: "illegal-graph-edge",
          source: "mod-civ7-intelligence-bridge",
          target: "@mateicanavra/civ7-sdk",
        }),
      ])
    );
  });

  test("reports boundary config drift from taxonomy constraints", async () => {
    const taxonomy = parseBoundaryTaxonomy(await readTaxonomyMarkdown());
    const audit = auditBoundaryTaxonomy({
      taxonomy,
      manifests: manifestBackedProjects(taxonomy.projects),
      nxProjects: fakeNxProjects(
        taxonomy.projects
          .filter((project) => project.root !== ".")
          .map((project) => [project.name, project.root, project.tags])
      ),
      configConstraints: taxonomy.constraints.filter(
        (constraint) => constraint.sourceTag !== "kind:foundation"
      ),
      graphEdges: [],
    });

    expect(audit.issues).toContainEqual(
      expect.objectContaining({ reason: "config-constraint-mismatch" })
    );
  });

  test("extracts all duplicated ESLint boundary config blocks as one constraint set", () => {
    const constraints: TaxonomyConstraint[] = extractBoundaryConfigConstraints([
      {
        rules: {
          "@nx/enforce-module-boundaries": [
            "error",
            {
              depConstraints: [
                { sourceTag: "kind:foundation", onlyDependOnLibsWithTags: ["kind:foundation"] },
              ],
            },
          ],
        },
      },
      {
        rules: {
          "@nx/enforce-module-boundaries": [
            "error",
            {
              depConstraints: [
                { sourceTag: "kind:foundation", onlyDependOnLibsWithTags: ["kind:foundation"] },
              ],
            },
          ],
        },
      },
    ]);

    expect(constraints).toEqual([
      { sourceTag: "kind:foundation", onlyDependOnLibsWithTags: ["kind:foundation"] },
    ]);
  });
});

async function readTaxonomyMarkdown(): Promise<string> {
  return readFile(path.join(repoRoot, "docs/projects/habitat-harness/taxonomy.md"), "utf8");
}

function fakeNxProjects(
  projects: Array<[name: string, root: string, tags: string[]]>
): NxProjectMetadata[] {
  return projects.map(([name, root, tags]) => ({
    name,
    root,
    sourceRoot: null,
    tags,
    targets: [],
  }));
}

function manifestBackedProjects(projects: Array<{ name: string; root: string; tags: string[] }>) {
  return projects
    .filter((project) => project.root !== ".habitat")
    .map((project) => ({
      name: project.name,
      root: project.root,
      tags: project.root === "." ? [] : project.tags,
    }));
}
