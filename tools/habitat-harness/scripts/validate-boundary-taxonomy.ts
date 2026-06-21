import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  auditBoundaryTaxonomy,
  parseBoundaryTaxonomy,
  readBoundaryConfigConstraints,
  readNxProjectMetadataFromGraph,
  readWorkspaceManifestProjects,
} from "../src/lib/boundary-taxonomy.js";
import { repoRoot } from "../src/lib/paths.js";

const taxonomy = parseBoundaryTaxonomy(
  await readFile(path.join(repoRoot, "docs/projects/habitat-harness/taxonomy.md"), "utf8")
);
const manifests = await readWorkspaceManifestProjects();
const { projects, graphEdges } = await readNxProjectMetadataFromGraph();
const configConstraints = await readBoundaryConfigConstraints();

const audit = auditBoundaryTaxonomy({
  taxonomy,
  manifests,
  nxProjects: projects,
  configConstraints,
  graphEdges,
});

const summary = {
  ok: audit.ok,
  projectCount: audit.projectCount,
  nxProjectCount: audit.nxProjectCount,
  graphEdgeCount: audit.graphEdgeCount,
  issueCount: audit.issues.length,
  noteCount: audit.notes.length,
};

console.log(JSON.stringify(summary, null, 2));

if (!audit.ok) {
  for (const issue of audit.issues) {
    console.error(`${issue.reason}: ${issue.message}`);
  }
  process.exit(1);
}
