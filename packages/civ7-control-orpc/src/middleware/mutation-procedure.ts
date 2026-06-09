import { civ7MutationProofBoundaryMiddleware } from "./mutation-proof-boundary";
import { civ7MutationReadinessMiddleware } from "./mutation-readiness";

type WithMutationProofBoundary<TProcedure> = TProcedure extends Readonly<{
  use(middleware: typeof civ7MutationProofBoundaryMiddleware): infer TProofed;
}> ? TProofed
  : never;

type WithMutationReadiness<TProcedure> = TProcedure extends Readonly<{
  use(middleware: typeof civ7MutationReadinessMiddleware): infer TReady;
}> ? TReady
  : never;

export function civ7ControlOrpcMutationProcedure<TProcedure>(
  procedure: TProcedure,
): WithMutationProofBoundary<WithMutationReadiness<TProcedure>> {
  return (procedure as any)
    .use(civ7MutationReadinessMiddleware)
    .use(civ7MutationProofBoundaryMiddleware);
}
