# Source Synthesis

**Change:** `habitat-scaffold-contract-repair`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

`docs/projects/habitat-harness/dra-takeover-frame.md` makes the repair
necessary:

- records and commands must tell future agents what is true now;
- baselines are shrink-only;
- Stage 0 must reconcile historical closure claims against current executable
  behavior;
- `CLAIM-P1-BASELINE` requires every hardened baseline to be explicit,
  committed, and documented.

## Seed Code Evidence

- `tools/habitat-harness/src/lib/baseline.ts` defines baseline files under
  `tools/habitat-harness/baselines/<rule-id>.json` and currently returns an
  empty set when a file is absent.
- `tools/habitat-harness/src/lib/command-engine.ts` loads one baseline per
  selected rule, applies it to diagnostics, and reports `locked` when the
  loaded baseline set is empty and `exceptionPath` is `none`.
- `tools/habitat-harness/src/lib/command-engine.ts` always appends
  `baseline-integrity`, so invalid selector truth is owned by
  `habitat-oclif-entrypoint-repair` and not this packet.
- `tools/habitat-harness/src/rules/architecture.ts` can mark
  `adapter-boundary` allowlisted findings as `baselined: true` before
  `applyBaseline()` runs.
- `tools/habitat-harness/baselines/adapter-boundary.json` was the only Habitat
  baseline file at the seed capture.
- `tools/habitat-harness/src/rules/rules.json` has two current non-`none`
  external exception sources: `adapter-boundary` and `doc-ambiguity`.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` writes an empty
  baseline file for newly generated pattern rules, but generator metadata does
  not yet require authority/proving source fields.
- Current `HarnessRule` metadata does not encode the authority source, proving
  source, false-positive model, current-tree scan result, or baseline policy
  fields needed by the future pattern-generator metadata repair.

## Seed Command Evidence

Commands run on the packet seed branch before the repair-chain downstack was
accepted:

| Command | Result | Claim supported |
| --- | --- | --- |
| `bun run habitat:check -- --json --rule adapter-boundary` | exit 0; `adapter-boundary` pass; locked false; parser/exception supplied baselined diagnostics; `baseline-integrity` pass | Adapter-boundary debt was visible but partly supplied by parser/exception behavior. |
| `bun run habitat:check -- --json --rule adapter-boundary --base HEAD` | exit 0; diagnostics present; zero unbaselined; `baseline-integrity` pass | Baseline growth check passed on the seed clean state. |
| `bun run habitat:check -- --json --rule workspace-entrypoints` | exit 0; `workspace-entrypoints` pass; locked true; no explicit baseline file existed | Missing file acted as empty locked baseline in the seed behavior. |
| `bun run --cwd tools/habitat-harness test` | 3 files, 14 tests passed | Seed tests passed but did not cover the full baseline contract matrix. |

## Current Downstack Evidence At Implementation Start

- Current branch: `agent-HR-habitat-scaffold-contract-repair` above accepted
  `agent-HR-habitat-grit-proof-repair` head
  `7681f7c16 fix(habitat): prove live Grit apply boundary`.
- Current rule pack: 41 registered rules.
- Current explicit Grit corpus: 22 committed empty Grit baseline files exist
  and are fixture/corpus evidence, not standalone proof that the broader
  scaffold contract is closed.
- Current non-Grit gap: registered non-Grit rules without debt still needed
  committed empty baseline files; external exception sources still needed
  modeled projection equality.
- Current external exception inventory: `adapter-boundary` and `doc-ambiguity`
  are the only non-`none` `exceptionPath` rules.

## Historical Claim Evidence

H2 scaffold records describe:

- `baselines/<rule-id>.json`;
- `path::message` keys;
- shrink-only behavior;
- empty baseline as locked;
- `baseline-integrity` comparing against merge-base;
- adapter-boundary real debt captured partly through baseline and partly
  through script exception behavior.

Those records are useful source material, but current Stage 0 makes them
historical where they rely on implicit file absence or external exception
ownership.

The current executable key format is `path::message`. Any older H2 text that
implies `ruleId + path + fingerprint` keys is stale unless a separate
key-format migration is accepted.

## Design Implications

1. Baseline state must be a typed state machine, not a bare set.
2. Missing baseline files must become contract failures or committed explicit
   baseline files before closure.
3. Committed `tools/habitat-harness/baselines/<rule-id>.json` files are the v1
   storage model for registered rules without modeled external exception
   sources.
4. Adapter-boundary and doc-ambiguity debt must be reconciled into Habitat
   baseline ownership or modeled as external exception sources.
5. Parser/native `baselined: true` output must exactly match accepted baseline
   contract state.
6. Graphite stack comparison must prevent child branches from growing a
   downstack rule baseline while trunk merge-base makes that rule appear new.
7. Rule-introduction baseline writes require an accepted baseline manifest;
   generator authority metadata remains a future owner.
8. Implementation must run the Effect adoption gate and choose Effect if it
   removes recurring manual failure classes in this baseline repair.
9. `--expand-baseline` write guards depend on selector truth from the command
   repair.
10. Generator metadata repair should not be folded into this packet, but it must
   consume the explicit baseline-file contract.

## Uncertainties

- Resolved in implementation: `adapter-boundary` and `doc-ambiguity` remain
  modeled external exception sources; `adapter-boundary.json` is removed rather
  than grown because growing an existing-rule Habitat baseline would violate
  shrink-only.
- Resolved in implementation: selector repair is downstack, and
  `--expand-baseline` now consumes that selector boundary before baseline
  mutation.
- Resolved in implementation: the Effect adoption gate chose a plain
  TypeScript typed-state module for this local synchronous contract, with a
  stop/reopen trigger if baseline work expands into shared async command
  orchestration or scoped resource handling.
