import type { NonEmptyTuple } from "type-fest";

import { EARTHLIKE_COLD_REEF_STUDY } from "./benchmarks/earthlike-cold-reef.study.js";
import { EARTHLIKE_DEEP_OCEAN_STUDY } from "./benchmarks/earthlike-deep-ocean.study.js";
import { EARTHLIKE_ECOLOGY_STUDY } from "./benchmarks/earthlike-ecology.study.js";
import { EARTHLIKE_FLOODPLAIN_STUDY } from "./benchmarks/earthlike-floodplain.study.js";
import { EARTHLIKE_GEOGRAPHY_STUDY } from "./benchmarks/earthlike-geography.study.js";
import { EARTHLIKE_HUGE_RELIEF_COHORT_STUDY } from "./benchmarks/earthlike-huge-relief-cohort.study.js";
import { EARTHLIKE_OROGENY_STUDY } from "./benchmarks/earthlike-orogeny.study.js";
import { EARTHLIKE_PLACEMENT_STUDY } from "./benchmarks/earthlike-placement.study.js";
import { EARTHLIKE_RELIEF_REPRESENTATIVE_STUDY } from "./benchmarks/earthlike-relief-representative.study.js";
import { SHIPPED_ARID_CLIMATE_STUDIES } from "./benchmarks/shipped-arid-climate.study.js";
import { SHIPPED_GEOGRAPHY_STUDY } from "./benchmarks/shipped-geography.study.js";
import { SHIPPED_IDENTITY_STUDIES } from "./benchmarks/shipped-identities.study.js";
import type { StandardMetricStudy } from "./model.js";

/** Closed executable study bank for the shipped Standard recipe product. */
export const STANDARD_METRIC_STUDIES: NonEmptyTuple<StandardMetricStudy> = Object.freeze([
  ...SHIPPED_IDENTITY_STUDIES,
  ...SHIPPED_ARID_CLIMATE_STUDIES,
  SHIPPED_GEOGRAPHY_STUDY,
  EARTHLIKE_GEOGRAPHY_STUDY,
  EARTHLIKE_DEEP_OCEAN_STUDY,
  EARTHLIKE_ECOLOGY_STUDY,
  EARTHLIKE_COLD_REEF_STUDY,
  EARTHLIKE_FLOODPLAIN_STUDY,
  EARTHLIKE_OROGENY_STUDY,
  EARTHLIKE_RELIEF_REPRESENTATIVE_STUDY,
  EARTHLIKE_HUGE_RELIEF_COHORT_STUDY,
  EARTHLIKE_PLACEMENT_STUDY,
] satisfies NonEmptyTuple<StandardMetricStudy>);
