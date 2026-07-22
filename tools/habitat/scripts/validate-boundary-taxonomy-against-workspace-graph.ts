import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  auditBoundaryTaxonomy,
  parseBoundaryTaxonomy,
} from "@habitat/cli/service/model/graph/policy/validate_boundary_taxonomy_against_workspace_graph.policy";
import {
  readBoundaryConfigConstraints,
  readNxProjectMetadataFromGraph,
  readWorkspaceManifestProjects,
} from "@habitat/cli/validation/validate_boundary_taxonomy_against_workspace_graph-inputs";

const taxonomyPath = path.join(repoRoot, "docs/projects/habitat-harness/taxonomy.md");
const taxonomy = parseBoundaryTaxonomy(await readFile(taxonomyPath, "utf8"));
const manifests = await readWorkspaceManifestProjects(repoRoot);
const { projects, graphEdges } = await readNxProjectMetadataFromGraph();
const configConstraints = readBoundaryConfigConstraints();

const audit = auditBoundaryTaxonomy({
  taxonomy,
  manifests,
  nxProjects: projects,
  configConstraints,
  graphEdges,
});

console.log(
  JSON.stringify(
    {
      ok: audit.ok,
      projectCount: audit.projectCount,
      nxProjectCount: audit.nxProjectCount,
      graphEdgeCount: audit.graphEdgeCount,
      issueCount: audit.issues.length,
      noteCount: audit.notes.length,
    },
    null,
    2
  )
);

for (const note of audit.notes) {
  console.error(`note:${note.reason}: ${note.message}`);
}

if (!audit.ok) {
  for (const issue of audit.issues) {
    console.error(`${issue.reason}: ${issue.message}`);
  }
  process.exit(1);
}
