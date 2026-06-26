import { Data } from "effect";

export class CommandUnavailable extends Data.TaggedError("CommandUnavailable")<{
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly cause: string;
}> {}

export class CommandFailed extends Data.TaggedError("CommandFailed")<{
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly exitCode: number;
  readonly stderr: string;
}> {}

export class CommandInterrupted extends Data.TaggedError("CommandInterrupted")<{
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly timeoutMs?: number;
  readonly signal: string;
  readonly cause: string;
}> {}

export type CommandProviderError = CommandUnavailable | CommandFailed | CommandInterrupted;
