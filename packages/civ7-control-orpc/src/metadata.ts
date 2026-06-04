export type Civ7ControlOrpcProcedureMeta = Readonly<{
  family?: "runtime" | "notifications" | "unit" | "city" | "map" | "strategy";
  procedureKey?: string;
  proofBoundary?: "local-package-test" | "pending-runtime-proof" | "runtime-proof";
  risk?: "read-only" | "runtime-support" | "mutation";
}>;
