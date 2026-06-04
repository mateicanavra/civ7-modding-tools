export type Civ7ControlOrpcProcedureMeta = Readonly<{
  family?:
    | "attention"
    | "runtime"
    | "notifications"
    | "unit"
    | "city"
    | "map"
    | "player"
    | "strategy"
    | "operations";
  procedureKey?: string;
  proofBoundary?: "local-package-test" | "pending-runtime-proof" | "runtime-proof";
  risk?: "read-only" | "runtime-support" | "mutation";
}>;
