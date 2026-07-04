import { artifactContracts as foundationArtifactContracts } from "@mapgen/domain/foundation/artifacts";

export const foundationArtifacts = {
  mesh: foundationArtifactContracts.mesh.artifact,
  mantlePotential: foundationArtifactContracts.mantlePotential.artifact,
  mantleForcing: foundationArtifactContracts.mantleForcing.artifact,
  crustInit: foundationArtifactContracts.crustInit.artifact,
  crust: foundationArtifactContracts.crust.artifact,
  plateMotion: foundationArtifactContracts.plateMotion.artifact,
  plateGraph: foundationArtifactContracts.plateGraph.artifact,
  tectonicSegments: foundationArtifactContracts.tectonicSegments.artifact,
  tectonicHistory: foundationArtifactContracts.tectonicHistory.artifact,
  tectonicProvenance: foundationArtifactContracts.tectonicProvenance.artifact,
  plateTopology: foundationArtifactContracts.plateTopology.artifact,
  tectonics: foundationArtifactContracts.currentTectonics.artifact,
} as const;
