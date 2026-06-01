export type CompileErrorCode =
  | "config.invalid"
  | "stage.compile.failed"
  | "stage.unknown-step-id"
  | "op.config.invalid"
  | "op.missing"
  | "step.normalize.failed"
  | "op.normalize.failed"
  | "normalize.not.shape-preserving";

export type CompileErrorItem = Readonly<{
  code: CompileErrorCode;
  path: string;
  message: string;
  stageId?: string;
  stepId?: string;
  opKey?: string;
  opId?: string;
}>;
