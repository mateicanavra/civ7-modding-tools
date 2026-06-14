## Why

The Habitat command surface is the first trust boundary for the recovery
program. Current behavior contradicts the H4.5 oclif closure record:

- `bun run habitat -- --help` exits 2 with `Unknown habitat command: --help`.
- `bun run habitat -- check --help` exits 2 without command help.
- `bun run habitat:check -- --json --rule definitely-not-a-rule` exits 0 with
  only `baseline-integrity`.
- `bun run habitat:check -- --json --tool definitely-not-a-tool` exits 0 with
  only `baseline-integrity`.

That failure mode blocks every downstream Habitat proof. Future agents cannot
trust help output, selector filters, or old closure records while the canonical
root/dev path and invalid selector path can produce false confidence.

This repair restores command-surface truth before broader Grit proof repair and
pattern backfill. It keeps oclif as the outer command shell, repairs the
canonical root/dev/production entrypoints, and turns invalid selector requests
into explicit Habitat-native failures instead of green check reports.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md` Product Outcome, Hard
  Core, Current Known Contradictions, First Recovery Wave.
- `docs/projects/habitat-harness/recovery-claim-ledger.md` command trust rows:
  `CLAIM-H45-CLI`, `CLAIM-P0-ROOT-HELP`, `CLAIM-P0-SUBCOMMAND-HELP`,
  `CLAIM-P0-PROD-RUNNER`, `CLAIM-P0-UNKNOWN-COMMAND`,
  `CLAIM-P0-UNKNOWN-RULE`, and `CLAIM-P0-UNKNOWN-TOOL`.
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md` local
  Effect decision criteria.
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md` command
  surface, selector, and test-gap diagnosis.
- `openspec/changes/habitat-oclif-cli/specs/habitat-harness/spec.md` existing
  oclif help and command lifecycle requirements.
- `packages/cli/bin/dev.ts` and `packages/cli/bin/run.js` repo-local oclif
  runner precedent.

## What Changes

- Replace the current manual dev dispatcher in
  `tools/habitat-harness/bin/dev.ts` with the repo-standard oclif development
  runner shape so root help, subcommand help, and unknown-command handling are
  owned by oclif command discovery.
- Prove the production runner from a clean build and generated manifest, not
  from stale ignored build output.
- Add real entrypoint tests or smoke tests that execute the canonical root/dev
  and production command paths. Command-class tests with a mocked engine remain
  useful but cannot be the only proof.
- Introduce an explicit rule-selection result boundary for `--owner`, `--rule`,
  and `--tool`. If requested selectors match no rule, Habitat emits a failing
  selector diagnostic and exits non-zero. The same selector boundary applies to
  `--expand-baseline`; authoring mode must not silently do nothing for an
  invalid selector.
- Preserve CheckReport schema version 1 for JSON selector failures by rendering
  a Habitat-native selector failure report rather than throwing unstructured
  errors after partial report construction.
- Update stale Habitat records that currently claim root/check help proof or
  H1-H8 local closure without current evidence.

## What Does Not Change

- No new Grit patterns, baselines, taxonomy edges, hook behavior, generated
  artifacts, product/runtime behavior, or architecture rules are introduced in
  this slice.
- The existing oclif command classes remain the command shell unless current
  proof shows they cannot satisfy root/dev/production behavior.
- The valid `--tool grit-check` path remains a Grit proof concern for
  `habitat-grit-proof-repair`; this slice only guarantees selector truth and
  command entrypoint behavior.
- Effect is not adopted in this P0 command-surface repair unless the
  implementation design cannot provide typed selector failures, command
  provenance, service-test seams, and root/dev/prod proof without it.

## Effect Decision For This Slice

The local Effect fit evidence shows high value for typed selector/policy
failures and command provenance, but direct source oclif help already works and
the known help failure is localized to the manual root/dev dispatcher. This
slice therefore starts as `habitat-no-effect-p0-command-repair`:

- oclif remains the outer command shell;
- selector validation must use explicit typed result objects or typed error
  classes in current TypeScript;
- command proof must record argv/cwd/stdout/stderr/exit behavior even if the
  shared process runner is not replaced yet;
- Effect adoption is reopened if the repair starts wrapping string/throwing
  control flow without typed selector outcomes, if production proof requires a
  broader command runner redesign, or if command provenance cannot be captured
  cleanly with the current runner.

## Requires

- `habitat-oclif-cli` implemented artifacts.
- Stage 0 claim ledger row evidence for command trust.
- Effect orchestration evaluation read before implementation.

## Enables Parallel Work

- `habitat-grit-proof-repair` can trust command selectors once this repair
  lands.
- `habitat-scaffold-contract-repair` can design baseline semantics without
  selector false-greens obscuring rule selection.
- `habitat-effect-check-pipeline` can be designed against a truthful P0 command
  surface instead of repairing root help at the same time.

## Affected Owners

- `tools/habitat-harness/bin/dev.ts`
- `tools/habitat-harness/bin/run.js`
- `tools/habitat-harness/src/bin/habitat.ts`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/diagnostics.ts` only if needed to render a
  schema-compatible selector failure report.
- `tools/habitat-harness/test/**`
- Root `package.json` Habitat scripts if runner invocation changes.
- Stale Habitat/OpenSpec records named in this change's downstream realignment
  ledger.

## Forbidden Owners

- No generated `dist/**` or `oclif.manifest.json` hand edits.
- No new rule-pack ownership, Grit pattern semantics, Biome write behavior, Nx
  graph semantics, hook side effects, or baseline expansion policy.
- No `process.exit()` from reusable rule/check libraries.
- No command-class-only proof for root/dev/production behavior.
- No selector failure that exits 0 or emits a green report.

## Stop Conditions

- Root/dev help cannot be repaired without replacing oclif or changing the
  command set.
- Production runner proof depends on ignored stale build artifacts.
- Invalid selectors cannot be represented as schemaVersion 1 diagnostics without
  changing the public CheckReport contract.
- Manual TypeScript repair cannot provide explicit selector outcomes and
  command proof; if this occurs, open the Effect command/check-pipeline slice
  before implementation proceeds.
- Any P1/P2 review finding identifies a command behavior, selector semantics,
  or stale-record overclaim that the packet does not address.

## Consumer Impact

Agents and contributors can use the canonical command surface as a trustworthy
orientation and verification primitive:

- help works from the root script, direct development runner, and production
  runner after build;
- unknown commands fail as unknown commands, not as help failures;
- invalid rule/tool/owner selectors fail explicitly;
- valid selectors preserve existing CheckReport JSON compatibility;
- stale H4.5 closure records are corrected from "current proof" to historical
  evidence once the repair lands.

## Verification Gates

- `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`
- `bun run --cwd tools/habitat-harness clean`
- `bun run habitat -- --help`
- `bun run habitat -- check --help`
- `bun tools/habitat-harness/bin/dev.ts --help`
- `bun tools/habitat-harness/bin/dev.ts check --help`
- `bun tools/habitat-harness/bin/dev.ts definitely-not-a-command`
- `bun run nx run @internal/habitat-harness:build`
- `bun tools/habitat-harness/bin/run.js --help`
- `bun tools/habitat-harness/bin/run.js check --help`
- `bun tools/habitat-harness/bin/run.js definitely-not-a-command`
- `bun run habitat -- definitely-not-a-command`
- `bun run habitat:check -- --rule definitely-not-a-rule`
- `bun run habitat:check -- --tool definitely-not-a-tool`
- `bun run habitat:check -- --owner definitely-not-a-project`
- `bun run habitat:check -- --json --rule definitely-not-a-rule`
- `bun run habitat:check -- --json --tool definitely-not-a-tool`
- `bun run habitat:check -- --json --owner definitely-not-a-project`
- `bun run habitat:check -- --json --owner @civ7/control-orpc --tool biome`
- `bun run habitat:check -- --json --output /tmp/habitat-invalid-selector.json --rule definitely-not-a-rule`
- `bun run habitat:check -- --json --rule grit-check`
- `bun run habitat:check -- --json --tool grit-check`
- `bun run habitat:check -- --expand-baseline --rule definitely-not-a-rule`
- `bun run habitat:check -- --expand-baseline --owner definitely-not-a-project`
- `bun run habitat:check -- --expand-baseline --tool definitely-not-a-tool`
- `bun run habitat:check -- --expand-baseline --owner @civ7/control-orpc --tool biome`
- Entrypoint tests that execute root/dev/prod paths and assert exit code plus
  output class.
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec:validate`
