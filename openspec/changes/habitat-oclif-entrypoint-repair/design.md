## Frame

### Objective

Make Habitat command trust true again for the canonical root, development, and
production entrypoints, and make requested selector failures impossible to
confuse with green check reports.

### Product Movement

This repair moves Habitat toward the executable structural operating system by
restoring the command surface agents use before authoring, verifying, or
running safe transformations. A harness that cannot truthfully answer help or
selector questions cannot be the repo's structural operating system.

### Exterior

- Grit current-tree proof and apply safety.
- Baseline missing-file policy beyond selector/report rendering.
- Hook side-effect policy.
- Classify target existence.
- New Effect dependency adoption except if required by a stop condition.

### Falsifier

This design fails if implementation can still produce a successful Habitat
check when a requested `--owner`, `--rule`, or `--tool` selector matches no
rules, or if root/dev/production help proof remains dependent on mocked command
classes rather than real entrypoint execution.

## Current Diagnosis

The command failure has two distinct causes:

1. `tools/habitat-harness/bin/dev.ts` uses a manual command map. It treats
   `--help` as a command name and exits before oclif can render root help.
   Direct `bun tools/habitat-harness/src/bin/habitat.ts --help` works, so the
   repair target is the canonical root/dev dispatch path.
2. `selectRules()` returns an array without validating requested selectors.
   `createCheckReport()` then appends `baseline-integrity`, so invalid selector
   requests can exit 0 with one green built-in report.

These are not one bug. Help belongs to the command shell; selector truth belongs
to the check/report boundary.

## System Dynamics

The current loop is reinforcing:

1. Old phase records claim help and command tests passed.
2. Future agents trust the old closure claim.
3. Root help and invalid selectors fail silently or green.
4. The false-green command output becomes new proof for downstream repairs.

The repair adds a balancing loop at the command boundary: every requested
selector is validated before rule execution, and every command proof is run
through the same root/dev/prod path future agents use.

## Implementation Shape

### Entrypoint Repair

- Replace the manual `commands` map in `bin/dev.ts` with the repo-standard oclif
  development runner pattern used by `packages/cli/bin/dev.ts`.
- Preserve Habitat package root resolution and source command discovery for Bun
  development execution.
- Keep `bin/run.js` as the production oclif runner, and prove it only after the
  harness package build regenerates the manifest/build output.
- Keep `src/bin/habitat.ts` as the source oclif shim only if it remains useful
  for direct source invocation; it must not be the only passing help path.

### Selector Boundary

Introduce an explicit rule-selection boundary before report construction:

```ts
type RuleSelectionResult =
  | { ok: true; rules: HarnessRule[]; requested: RuleSelection }
  | {
      ok: false;
      requested: RuleSelection;
      reason:
        | "unknown-selector"
        | "wrong-selector-namespace"
        | "empty-selection";
      selectorFacts: RuleSelectorFact[];
      emptyIntersection?: {
        participants: RuleSelectorFact[];
        matchingRuleIdsBySelector: Record<string, string[]>;
      };
      message: string;
    };
```

Implementation may choose names that fit the codebase, but it must preserve
structured facts rather than leaving decisive semantics in `message`:

```ts
type RuleSelectorFact = {
  kind: "owner" | "rule" | "tool";
  requestedValue: string;
  known: boolean;
  matchedNamespace?: "owner" | "rule" | "tool";
  matchingRuleIds: string[];
};
```

The selector boundary must cover these states:

- requested owner does not match any rule owner;
- requested rule id does not exist;
- requested tool does not exist;
- requested value exists in a different namespace, such as `--rule grit-check`
  where `grit-check` is a known tool id;
- every individual selector exists, but the combined selector set has no rule;
- no requested filters means "all rules" and remains valid.

For check JSON mode, invalid selection renders a schemaVersion 1 `CheckReport`
with:

- `ok: false`;
- a single Habitat-native enforced rule report such as
  `rule-selection-integrity`;
- one non-baselined error diagnostic naming the invalid selector and remediation;
- the original command arguments in `command`;
- no real rule execution and no green-only `baseline-integrity` report.
- `--output` behavior identical to valid JSON reports: when an output path is
  requested, the failing CheckReport is written there and stdout behavior stays
  consistent with the existing check command contract.

For human mode, the command exits non-zero and prints a concise selector failure
that names the invalid selector and explains whether the value was checked as
an owner, rule id, tool id, or combined selector set.

For `--expand-baseline`, invalid selection exits non-zero before baseline
authoring and prints the same selector failure. It does not create, rewrite, or
delete baseline files.

### P0 Service Seam

This slice does not need to redesign the full check engine, but it must not
make selector validation depend on the real filesystem, real baselines, or real
rule execution.

Required seam:

- selector validation is a pure function over a supplied rule registry;
- unit tests can supply a fake registry with known owners, tools, rule ids, and
  an empty-intersection case;
- report rendering tests can turn a synthetic selector failure into a
  schemaVersion 1 `CheckReport` without executing rule detectors;
- `createCheckReport()` may remain the production orchestration entry for this
  slice, but selector validation must occur before baseline loading and before
  `executeRule()`.

If implementation requires fake clock, fake baseline store, fake command
runner, or fake filesystem to test additional check-pipeline policy outcomes,
the P0 slice must stop and open `habitat-effect-check-pipeline` or a manual
service-seam design before adding more branches to `createCheckReport()`.

### Command Proof Record Shape

Every command proof recorded for this slice must capture:

| Field | Required content |
| --- | --- |
| Proof label | command-surface / selector-failure / JSON compatibility / production-runner / stale-record realignment |
| Invocation | exact argv as executed |
| CWD | working directory |
| Env delta | relevant env additions or proof that none were set |
| Branch/commit | current branch and commit or dirty state at proof time |
| Exit code | numeric process exit code |
| Stdout class | help / JSON CheckReport / human failure / no output, with bounded excerpt when useful |
| Stderr class | empty / expected diagnostic / unexpected output, with bounded excerpt when useful |
| Duration | measured duration or timing source |
| Failure class | none / unknown command / selector failure / production artifact issue / tool failure |
| Non-claims | what the proof does not establish |

Production-runner proof must additionally record the build command, generated
artifact paths exercised, manifest/dist mtime or hash after build, and whether
the worktree shows generated-output drift.

### Effect Decision

This slice does not adopt Effect up front. It must still use typed selector
outcomes and entrypoint proof:

- selector failure states must be represented structurally, not by inspecting
  rendered strings;
- tests must cover the typed selector states directly;
- root/dev/prod integration tests must capture exit code and output class;
- the Effect Trigger Matrix below is the authoritative stop rule for reopening
  `habitat-effect-check-pipeline` or `habitat-effect-command-runner`.

This is an explicit non-adoption decision for the P0 command slice, not a
global rejection of Effect.

## Write Set

Expected write set:

- `tools/habitat-harness/bin/dev.ts`
- `tools/habitat-harness/bin/run.js` if production runner proof exposes a path
  issue
- `tools/habitat-harness/src/bin/habitat.ts` if source shim routing needs
  alignment
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/lib/diagnostics.ts` only if schema-compatible
  selector report helpers belong there
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-oclif-cli/workstream/phase-record.md` only to mark
  stale closure claims as historical and point to this repair

Protected paths:

- `.grit/**`
- `tools/habitat-harness/baselines/**`
- generated `dist/**`
- generated `oclif.manifest.json`
- hook implementation files
- Nx taxonomy/boundary configuration

## Test And Proof Design

### Unit Tests

- `selectRules` or successor returns the four invalid selector states and the
  valid all-rules / valid filtered states.
- Invalid selector JSON report validates with `validateCheckReport`.
- Valid filtered `--rule` still emits selected rule plus `baseline-integrity`.
- Valid `--tool grit-check` still emits 22 Grit rules plus
  `baseline-integrity` until `habitat-grit-proof-repair` changes proof details.
- Invalid `--expand-baseline` selection exits non-zero without modifying
  baseline files.
- The fake registry covers the valid-individuals-empty-intersection case, such
  as owner `@civ7/control-orpc` and tool `biome`.

### Entrypoint Tests

Tests must execute real commands through child processes or equivalent
entrypoint-level harnessing:

- root package script: `bun run habitat -- --help`;
- root package script subcommand: `bun run habitat -- check --help`;
- direct dev runner: `bun tools/habitat-harness/bin/dev.ts --help`;
- direct dev runner subcommand:
  `bun tools/habitat-harness/bin/dev.ts check --help`;
- production runner after build: `bun tools/habitat-harness/bin/run.js --help`.

The test records must assert exit code and output class. Phase records must
capture the command proof record shape above. Command-class tests with mocked
engines may remain as unit tests, but they do not satisfy this gate.

Root and direct development runner proof must be run after removing harness
generated artifacts (`dist/**` and `oclif.manifest.json`) so source command
discovery is what passes. Production runner proof must run only after the fresh
build regenerates those artifacts.

### Verification Commands

Use the command list in `proposal.md`. Record each result in the workstream
phase record with a proof label:

- command-surface proof;
- selector-failure proof;
- JSON compatibility proof;
- production-runner proof;
- stale-record realignment proof.

## Downstream Realignment

This repair must patch or annotate stale current-proof claims in:

- `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`;
- `docs/projects/habitat-harness/workstream-record.md`;
- `docs/projects/habitat-harness/review-disposition-ledger.md`;
- `docs/projects/habitat-harness/discrepancy-log.md`;
- `docs/projects/habitat-harness/FRAME.md` status/branch language;
- any README or command reference that states mocked command-class tests prove
  root/dev/production behavior.

It must not erase history. Historical records should remain legible but must no
longer read as current proof after fresh evidence contradicts them.

## Review Lanes

- Command-surface reviewer: root/dev/prod help, unknown command, selector UX,
  command tests.
- Evidence reviewer: proof class labels, stale-record realignment, CheckReport
  compatibility.
- System reviewer: false-confidence loop, duplicate command owners, future
  Effect trigger.

Accepted P1/P2 findings block implementation until repaired or rejected with
source evidence.

## Effect Trigger Matrix

Open `habitat-effect-check-pipeline` or `habitat-effect-command-runner` before
dependent work if any row below occurs during implementation:

| Trigger | Required action |
| --- | --- |
| A non-selector check-pipeline policy failure is added to `createCheckReport()` | Open `habitat-effect-check-pipeline` or a reviewed service-seam design before implementation continues. |
| A second policy outcome is modeled as message parsing, generic throw, or implicit empty array | Open `habitat-effect-check-pipeline`. |
| Command proof needs provenance not available from the current runner result | Open `habitat-effect-command-runner` or add a reviewed command-proof adapter. |
| Unit tests require mocking the whole command engine to prove selector, baseline, or runner behavior | Open `habitat-effect-check-pipeline` or introduce explicit service seams. |
| A new external command failure class is needed beyond exitCode/stdout/stderr | Open `habitat-effect-command-runner`. |
