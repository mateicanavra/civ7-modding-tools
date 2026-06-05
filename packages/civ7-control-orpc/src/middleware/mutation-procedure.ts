import { civ7MutationApprovalMiddleware } from "./mutation-approval";
import { civ7MutationReadinessMiddleware } from "./mutation-readiness";

type WithMutationApproval<TProcedure> = TProcedure extends Readonly<{
  use(middleware: typeof civ7MutationApprovalMiddleware): infer TApproved;
}> ? TApproved
  : never;

type WithMutationReadiness<TProcedure> = TProcedure extends Readonly<{
  use(middleware: typeof civ7MutationReadinessMiddleware): infer TReady;
}> ? TReady
  : never;

export function civ7ControlOrpcMutationProcedure<TProcedure>(
  procedure: TProcedure,
): WithMutationReadiness<WithMutationApproval<TProcedure>> {
  return (procedure as any)
    .use(civ7MutationApprovalMiddleware)
    .use(civ7MutationReadinessMiddleware);
}
