import { Data } from "effect";

export class ConfigUnavailable extends Data.TaggedError("ConfigUnavailable")<{
  readonly source: string;
  readonly cause: string;
}> {}

export class JsonParseFailed extends Data.TaggedError("JsonParseFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

export class SchemaValidationFailed extends Data.TaggedError("SchemaValidationFailed")<{
  readonly subject: string;
  readonly cause: string;
}> {}

export class WorkspaceGraphUnavailable extends Data.TaggedError("WorkspaceGraphUnavailable")<{
  readonly cause: string;
}> {}

export class BaselineRefused extends Data.TaggedError("BaselineRefused")<{
  readonly reason: string;
  readonly detail: string;
}> {}

export class ProtectedZoneRefused extends Data.TaggedError("ProtectedZoneRefused")<{
  readonly path: string;
  readonly reason: string;
}> {}

export class UnsafeStagedState extends Data.TaggedError("UnsafeStagedState")<{
  readonly reason: string;
}> {}

export type HabitatDomainError =
  | ConfigUnavailable
  | JsonParseFailed
  | SchemaValidationFailed
  | WorkspaceGraphUnavailable
  | BaselineRefused
  | ProtectedZoneRefused
  | UnsafeStagedState;
