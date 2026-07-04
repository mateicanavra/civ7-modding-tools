import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "foundation", ops } as const);

export {
  artifact as crustArtifact,
  validate as validateCrustArtifact,
} from "./artifacts/crust.artifact.js";
export {
  artifact as crustInitArtifact,
  validate as validateCrustInitArtifact,
} from "./artifacts/crust-init.artifact.js";
export {
  artifact as mantleForcingArtifact,
  validate as validateMantleForcingArtifact,
} from "./artifacts/mantle-forcing.artifact.js";
export {
  artifact as mantlePotentialArtifact,
  validate as validateMantlePotentialArtifact,
} from "./artifacts/mantle-potential.artifact.js";
export {
  artifact as meshArtifact,
  validate as validateMeshArtifact,
} from "./artifacts/mesh.artifact.js";
export {
  artifact as plateGraphArtifact,
  validate as validatePlateGraphArtifact,
} from "./artifacts/plate-graph.artifact.js";
export {
  artifact as plateMotionArtifact,
  validate as validatePlateMotionArtifact,
} from "./artifacts/plate-motion.artifact.js";
export {
  artifact as plateTopologyArtifact,
  validate as validatePlateTopologyArtifact,
} from "./artifacts/plate-topology.artifact.js";
export {
  artifact as tectonicsArtifact,
  validate as validateTectonicsArtifact,
} from "./artifacts/current-tectonics.artifact.js";
export {
  artifact as tectonicHistoryArtifact,
  validate as validateTectonicHistoryArtifact,
} from "./artifacts/tectonic-history.artifact.js";
export {
  artifact as tectonicProvenanceArtifact,
  validate as validateTectonicProvenanceArtifact,
} from "./artifacts/tectonic-provenance.artifact.js";
export {
  artifact as tectonicSegmentsArtifact,
  validate as validateTectonicSegmentsArtifact,
} from "./artifacts/tectonic-segments.artifact.js";

export default domain;
