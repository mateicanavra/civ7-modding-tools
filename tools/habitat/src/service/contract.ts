import { checkServiceContract } from "@habitat/cli/service/modules/check/contract";
import { classifyServiceContract } from "@habitat/cli/service/modules/classify/contract";
import { fixServiceContract } from "@habitat/cli/service/modules/fix/contract";
import { graphServiceContract } from "@habitat/cli/service/modules/graph/contract";
import { hookServiceContract } from "@habitat/cli/service/modules/hook/contract";
import { verifyServiceContract } from "@habitat/cli/service/modules/verify/contract";

export const habitatServiceContract = {
  check: checkServiceContract,
  classify: classifyServiceContract,
  fix: fixServiceContract,
  graph: graphServiceContract,
  hook: hookServiceContract,
  verify: verifyServiceContract,
};

export type HabitatServiceContract = typeof habitatServiceContract;
