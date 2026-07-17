import path from "node:path";
import { parseArgs } from "node:util";
import { Data, Effect, Match } from "effect";

export type StandaloneCheckRunner = "grit" | "habitat";

export interface StandaloneCheckRequest {
  readonly argv: readonly string[];
  readonly repoRoot: string;
  readonly json: boolean;
  readonly owner?: string;
  readonly rules: readonly string[];
  readonly runner?: StandaloneCheckRunner;
  readonly staged: boolean;
  readonly baselineIntegrity: boolean;
  readonly base: string;
}

export type StandaloneCheckInvocation =
  | { readonly kind: "help" }
  | { readonly kind: "check"; readonly request: StandaloneCheckRequest };

export type StandaloneCheckFailureKind =
  | "invalid-arguments"
  | "unsupported-selection"
  | "runtime-unavailable";

export class StandaloneCheckFailure extends Data.TaggedError("StandaloneCheckFailure")<{
  readonly kind: StandaloneCheckFailureKind;
  readonly message: string;
}> {}

export const parseStandaloneCheckInvocation = Effect.fn("habitat.standalone.check.parse")(
  function* (argv: readonly string[]) {
    const parsed = yield* Effect.try({
      try: () =>
        parseArgs({
          args: [...argv],
          allowPositionals: true,
          strict: true,
          options: {
            help: { type: "boolean", short: "h" },
            json: { type: "boolean" },
            "repo-root": { type: "string" },
            owner: { type: "string" },
            rule: { type: "string", multiple: true },
            runner: { type: "string" },
            staged: { type: "boolean" },
            "baseline-integrity": { type: "boolean" },
            base: { type: "string" },
          },
        }),
      catch: (cause) =>
        new StandaloneCheckFailure({
          kind: "invalid-arguments",
          message: String(cause),
        }),
    });
    const help = parsed.values.help ?? false;
    yield* Effect.succeed(help || validCheckPositionals(parsed.positionals)).pipe(
      Effect.filterOrFail(
        (valid) => valid,
        () => invalidArguments("Expected the single read-only command 'check'.")
      )
    );
    const repoRootInput = yield* optionalNonEmpty("--repo-root", parsed.values["repo-root"]);
    const owner = yield* optionalNonEmpty("--owner", parsed.values.owner);
    const base = (yield* optionalNonEmpty("--base", parsed.values.base)) ?? "main";
    const rules = yield* Effect.forEach(parsed.values.rule ?? [], (rule) =>
      requiredNonEmpty("--rule", rule)
    );
    const runner = yield* parseRunner(parsed.values.runner);
    const check = {
      kind: "check",
      request: {
        argv: [...argv],
        repoRoot: path.resolve(repoRootInput ?? process.cwd()),
        json: parsed.values.json ?? false,
        owner,
        rules,
        runner,
        staged: parsed.values.staged ?? false,
        baselineIntegrity:
          (parsed.values["baseline-integrity"] ?? false) || parsed.values.base !== undefined,
        base,
      },
    } satisfies StandaloneCheckInvocation;
    return Match.value(help).pipe(
      Match.when(true, () => ({ kind: "help" }) satisfies StandaloneCheckInvocation),
      Match.orElse(() => check)
    );
  }
);

export const standaloneCheckHelp = `Usage: habitat-sdk check [options]

Read-only Habitat structure and Grit checks.

Options:
  --repo-root <path>       Repository containing the .habitat authority tree
  --json                   Emit the normalized CheckReport JSON
  --owner <project>        Select rules owned by one workspace project
  --rule <id>              Select one rule; repeat for a curated rule set
  --runner <runner>        Select Grit or Habitat structure rules
  --staged                 Restrict supported rules to staged paths
  --baseline-integrity     Check shrink-only baseline integrity
  --base <ref>             Git base ref for baseline integrity (implies the check)
  -h, --help               Show this help

The standalone edge refuses scripts, file-layer rules, and Nx-backed rules. It exposes no mutation commands.`;

export function renderStandaloneCheckFailure(failure: StandaloneCheckFailure): string {
  return Match.value(failure.kind).pipe(
    Match.when("invalid-arguments", () => `Invalid Habitat invocation: ${failure.message}`),
    Match.when("unsupported-selection", () => `Unsupported Habitat selection: ${failure.message}`),
    Match.when("runtime-unavailable", () => `Habitat check unavailable: ${failure.message}`),
    Match.exhaustive
  );
}

const parseRunner = Effect.fn("habitat.standalone.check.runner")(function* (
  value: string | undefined
) {
  return yield* Match.value(value).pipe(
    Match.when(undefined, () => Effect.succeed<StandaloneCheckRunner | undefined>(undefined)),
    Match.when("grit", () => Effect.succeed<StandaloneCheckRunner | undefined>("grit")),
    Match.when("habitat", () => Effect.succeed<StandaloneCheckRunner | undefined>("habitat")),
    Match.orElse((unsupported) =>
      Effect.fail(
        new StandaloneCheckFailure({
          kind: "unsupported-selection",
          message: `runner must be 'grit' or 'habitat'; received '${unsupported}'.`,
        })
      )
    )
  );
});

const optionalNonEmpty = Effect.fn("habitat.standalone.check.optionalNonEmpty")(function* (
  flag: string,
  value: string | undefined
) {
  return yield* Match.value(value).pipe(
    Match.when(undefined, () => Effect.succeed(undefined)),
    Match.orElse((candidate) => requiredNonEmpty(flag, candidate))
  );
});

const requiredNonEmpty = Effect.fn("habitat.standalone.check.requiredNonEmpty")(function* (
  flag: string,
  value: string
) {
  return yield* Effect.succeed(value.trim()).pipe(
    Effect.filterOrFail(
      (normalized) => normalized.length > 0,
      () => invalidArguments(`${flag} requires a non-empty value.`)
    )
  );
});

function invalidArguments(message: string): StandaloneCheckFailure {
  return new StandaloneCheckFailure({ kind: "invalid-arguments", message });
}

function validCheckPositionals(positionals: readonly string[]): boolean {
  return positionals.length === 1 && positionals[0] === "check";
}
