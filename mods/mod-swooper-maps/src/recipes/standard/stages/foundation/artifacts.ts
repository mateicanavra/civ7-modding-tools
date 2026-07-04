import {
  crustArtifact,
  crustInitArtifact,
  mantleForcingArtifact,
  mantlePotentialArtifact,
  meshArtifact,
  plateGraphArtifact,
  plateMotionArtifact,
  plateTopologyArtifact,
  tectonicsArtifact,
  tectonicHistoryArtifact,
  tectonicProvenanceArtifact,
  tectonicSegmentsArtifact,
} from "@mapgen/domain/foundation";

export const foundationArtifacts = {
  mesh: meshArtifact,
  mantlePotential: mantlePotentialArtifact,
  mantleForcing: mantleForcingArtifact,
  crustInit: crustInitArtifact,
  crust: crustArtifact,
  plateMotion: plateMotionArtifact,
  plateGraph: plateGraphArtifact,
  tectonicSegments: tectonicSegmentsArtifact,
  tectonicHistory: tectonicHistoryArtifact,
  tectonicProvenance: tectonicProvenanceArtifact,
  plateTopology: plateTopologyArtifact,
  tectonics: tectonicsArtifact,
} as const;
