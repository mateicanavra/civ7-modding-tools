import type { CommandProviderError } from "@habitat/cli/resources/command/errors";
import { Data } from "effect";

export class FileReadFailed extends Data.TaggedError("FileReadFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

export class FileWriteFailed extends Data.TaggedError("FileWriteFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

export type HabitatProviderError = CommandProviderError | FileReadFailed | FileWriteFailed;
