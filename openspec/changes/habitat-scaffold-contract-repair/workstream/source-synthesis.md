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

## Current Code Evidence

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
- `tools/habitat-harness/baselines/adapter-boundary.json` is currently the only
  Habitat baseline file.
- `tools/habitat-harness/src/rules/rules.json` has two current non-`none`
  external exception sources: `adapter-boundary` and `doc-ambiguity`.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` writes an empty
  baseline file for newly generated pattern rules, but generator metadata does
  not yet require authority/proving source fields.
- Current `HarnessRule` metadata does not encode the authority source, proving
  source, false-positive model, current-tree scan result, or baseline policy
  fields needed by the future pattern-generator metadata repair.

## Fresh Command Evidence

Commands run on branch `codex/habitat-dra-takeover-frame`:

| Command | Result | Claim supported |
| --- | --- | --- |
| `bun run habitat:check -- --json --rule adapter-boundary` | exit 0; `adapter-boundary` pass; locked false; seven baselined diagnostics; `baseline-integrity` pass | Adapter-boundary debt is currently visible but partly supplied by parser/exception behavior. |
| `bun run habitat:check -- --json --rule adapter-boundary --base HEAD` | exit 0; seven diagnostics; zero unbaselined; `baseline-integrity` pass | Current baseline growth check passes on clean state. |
| `bun run habitat:check -- --json --rule workspace-entrypoints` | exit 0; `workspace-entrypoints` pass; locked true; no explicit baseline file exists | Missing file currently acts as empty locked baseline. |
| `bun run --cwd tools/habitat-harness test` | 3 files, 14 tests passed | Current tests pass but do not cover the full baseline contract matrix. |

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

- Whether adapter-boundary's remaining external exception source should be
  migrated fully into Habitat baseline files in this packet or modeled with a
  durable external-source contract.
- Whether doc-ambiguity should remain an external source or move into the
  Habitat baseline file model.
- Whether command repair will land before baseline implementation; if not,
  selector-sensitive mutation writes must remain closed.
- Whether the Effect adoption gate selects Effect services/layers for baseline
  state, comparison-base handling, command provenance, and test seams.
