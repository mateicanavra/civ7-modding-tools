import { checkServiceContract } from "@internal/habitat-harness/service/modules/check/contract";
import { classifyServiceContract } from "@internal/habitat-harness/service/modules/classify/contract";
import { fixServiceContract } from "@internal/habitat-harness/service/modules/fix/contract";
import { graphServiceContract } from "@internal/habitat-harness/service/modules/graph/contract";
import { hookServiceContract } from "@internal/habitat-harness/service/modules/hook/contract";
import { verifyServiceContract } from "@internal/habitat-harness/service/modules/verify/contract";

export const habitatServiceContract = {
  check: checkServiceContract,
  classify: classifyServiceContract,
  fix: fixServiceContract,
  graph: graphServiceContract,
  hook: hookServiceContract,
  verify: verifyServiceContract,
};

export type HabitatServiceContract = typeof habitatServiceContract;
