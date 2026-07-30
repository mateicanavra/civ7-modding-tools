import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicSegmentsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Classifies boundary edges into polarity-aware regimes and aligned event intensities. */
const computeTectonicSegments = createOp(ComputeTectonicSegmentsContract, { strategies });

export default computeTectonicSegments;
