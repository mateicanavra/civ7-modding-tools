import { civ7MutationReadinessMiddleware } from "./mutation-readiness";

type WithMutationReadiness<TProcedure> = TProcedure extends Readonly<{
  use(middleware: typeof civ7MutationReadinessMiddleware): infer TReady;
}> ? TReady
  : never;

export function civ7ControlOrpcMutationProcedure<TProcedure>(
  procedure: TProcedure,
): WithMutationReadiness<TProcedure> {
  return (procedure as any)
    .use(civ7MutationReadinessMiddleware);
}
