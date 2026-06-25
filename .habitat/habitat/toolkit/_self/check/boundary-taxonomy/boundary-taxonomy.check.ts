// Habitat-owned command-check adapter for boundary taxonomy validation.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "../../../../../../tools/habitat/src/resources/paths.ts";
import {
  auditBoundaryTaxonomy,
  parseBoundaryTaxonomy,
} from "../../../../../../tools/habitat/src/service/model/graph/policy/boundary-taxonomy.policy.ts";
import {
  readBoundaryConfigConstraints,
  readNxProjectMetadataFromGraph,
  readWorkspaceManifestProjects,
} from "../../../../../../tools/habitat/src/validation/boundary-taxonomy-inputs.ts";

const taxonomy = parseBoundaryTaxonomy(
  await readFile(path.join(repoRoot, "docs/projects/habitat-harness/taxonomy.md"), "utf8")
);
const manifests = await readWorkspaceManifestProjects(repoRoot);
const { projects, graphEdges } = await readNxProjectMetadataFromGraph();
const configConstraints = await readBoundaryConfigConstraints(
  path.join(repoRoot, "eslint.boundaries.config.mjs")
);

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
