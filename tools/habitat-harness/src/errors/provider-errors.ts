import { Data } from "effect";
import type { CommandProviderError } from "../providers/command/errors.ts";

export class FileReadFailed extends Data.TaggedError("FileReadFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

export class FileWriteFailed extends Data.TaggedError("FileWriteFailed")<{
  readonly path: string;
  readonly cause: string;
}> {}

export type HabitatProviderError = CommandProviderError | FileReadFailed | FileWriteFailed;
