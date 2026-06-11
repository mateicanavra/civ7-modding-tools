export type Civ7ControlOrpcProcedureMeta = Readonly<{
  family?:
    | "attention"
    | "readiness"
    | "runtime"
    | "notifications"
    | "unit"
    | "city"
    | "diplomacy"
    | "display"
    | "government"
    | "narrative"
    | "progression"
    | "map"
    | "player"
    | "strategy"
    | "turn"
    | "world";
  procedureKey?: string;
  proofBoundary?: "local-package-test" | "pending-runtime-proof" | "runtime-proof";
  risk?: "read-only" | "runtime-support" | "mutation";
}>;
