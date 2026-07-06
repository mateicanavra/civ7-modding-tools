# Domain-Operation Interior Descent: Opening Frame

Status: opening frame; execution gated on pre-descent readiness slices R2, R3, R4, R5, R6

Built: 2026-07-06

Owner: DRA Habitat authority-tree workstream steward

Method authority:
`.habitat/.active/frames/BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md` owns the
descent state machine this workstream instantiates.
`.habitat/.active/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md` operates
as the positive-assertion primitive inside it. The completed domain-root
descent is precedent; its packet grammar is precedent only, not controlling
authority.

Runway gate:
`.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`
slices R2 (config-facade consolidation), R3 (aggregate check runnability),
R4 (stale-blocker record refresh), R5 (descent workspace shape), and R6
(post-merge reconciliation) must close before descent execution begins.
Decision packets in this workstream may be ruled in parallel with the runway;
source and rule mutation may not start before it is clear.

## Current Boundary

Already law (survivor structure authority
`.habitat/blueprints/domain/require_domain_source_topology/structure.toml`):

- domain roots are closed: `index.ts`, `ops.ts`, `ops/`, `model/`, optional
  `artifacts/`;
- domain ops roots are closed: `contracts.ts`, `index.ts`, plus operation
  child directories;
- operation roots are closed at depth one: `contract.ts`, `index.ts` required;
  `types.ts`, `rules/`, `strategies/`, `policy/` allowed;
- model roots and artifact roots are closed.

Already enforced boundary law (`.habitat/blueprints/domain-operation/`):
adapter/engine-runtime import blocks, cross-operation runtime call
prohibition, projection/effect dependency prohibition, root config facade
import prohibition (widened by readiness slice R2), runtime orchestration
helper prohibition, operation contract file shape, and the domain ops registry
surface.

Not yet law:

- `strategies/`, `rules/`, and `policy/` internals have no enforced grammar:
  no required `index.ts` aggregation, no file-shape law, nothing preventing
  arbitrary nested modules inside an operation;
- strategy import law exists only as the foundation-local, underbroad
  `prohibit_foundation_strategy_nonlocal_imports`;
- operation topology law exists only as the ecology-local exemplar proxy
  `require_ecology_canonical_op_module_topology` (mode `open`, one domain);
- contract quality exists only as the ecology-local mixed script
  `validate_ecology_op_contract_quality`;
- `prohibit_domain_artifacts_modules` survives as a sentry because the
  topology law does not reach inside support directories (a nested
  `rules/artifacts.ts` probe passed topology and failed only the sentry).

## Future Boundary

Every operation interior is legible and enforced: support directories have a
closed grammar, strategy files have a positive import law, contract metadata
has a named owner, and the five residual rules above are absorbed, split, or
deleted with survivor proof. An agent editing any of the 101 operations knows
what is allowed without reading history.

## Coordinates

| Coordinate | Answer |
| --- | --- |
| Blueprint kind | `domain-operation` |
| Selected depth | operation interior: `strategies/`, `rules/`, `policy/` internals, the strategy import surface, and contract metadata ownership |
| Authority owner | drafted scope law under `.habitat/scopes/domain/scopes/ops/scopes/operation/**` (scope.md, file grammars, strategy pattern); enforcement home `.habitat/blueprints/domain-operation/` |
| Red corpus | `ledger.md` in this workstream; re-derived by evidence lanes at execution open |
| Row state | each seed row carries `defined destination`, `needs decision D1-D4`, `delete candidate`, or `law correction candidate` |
| Proof gate | Habitat wrapper behavior for each ratcheted surface; Injected violation proof per injectable failure class; Clean sample proof for allowed shapes; Record truth proof for ledger/manifest parity; Native tool behavior for lint/check/diff hygiene. Review disposition and Graphite state are workflow claims. Aggregate proof per readiness slice R3's accepted gate, else focused checks plus a named non-claim. |
| Ascent condition | residual cluster rows resolved or tracked outside this ratchet; survivor law green with injected-violation coverage; overlapping scaffolding classified or retired; roadmap updated |

## Selection Commitments

In:

- the operation interior grammar for all six domains' `ops/<operation>/`
  directories;
- the strategy import law as generic domain-operation authority;
- contract metadata ownership (the schema-description clause of the ecology
  quality script);
- absorption/retirement of the five residual rules named above;
- the drafted operation scope files as the starting assertion text.

Foreground:

- positive grammar first: assert what `strategies/`, `rules/`, `policy/` may
  contain, then let violations go red with destinations;
- the four decision packets are the only intended judgment apertures;
- census evidence in the row ledger seed is evidence, not authority.

Exterior:

- recipe, recipe-stage, and recipe-step work, including
  `prohibit_foundation_step_contract_config_bags` (named handoff domino to the
  recipes-and-stages descent);
- domain `model/` internals (queued as descent 3);
- broad strategy semantics redesign (which strategies exist, their behavior,
  their config values);
- schema/JSDoc quality beyond the owner ruling in decision packet 003;
- mod-map, Studio, toolkit, and workspace lanes;
- any behavior change in any operation.

## Expected Red Surface

From the 2026-07-06 censuses (exact rows in `ledger.md`):

- 3 strategy import anomalies: one cross-domain relative reach, one
  cross-domain package reach, one cross-operation reach;
- 4 `rules/` directories without `index.ts` aggregation;
- 2 `policy/` directories without `index.ts` aggregation;
- 9 operations without `strategies/` (all foundation `compute-*`; their
  contracts declare strategy envelopes) — red only under decision packet 001
  option (a);
- 6 contracts without schema description metadata — red only under the owner
  chosen in decision packet 003;
- 5 residual rules awaiting absorption, split, or deletion.

This is a bounded corpus. If execution-time censuses reveal a materially
larger red surface, that is law back-talk: stop and re-scope rather than
widening silently.

## Prework Aperture

Prework exists only for nondeterministic destinations. Exactly four are open,
each a decision packet in `decisions/`:

1. `001-strategy-container-law.md` — is `strategies/` required for every
   operation?
2. `002-strategy-dependency-classes.md` — the positive strategy import
   allowlist.
3. `003-contract-quality-owner.md` — who owns contract schema metadata law.
4. `004-rules-entrypoint-export-policy.md` — `rules/` aggregation grammar and
   the shim-re-export sentry's fate.

Every other seed row has a deterministic destination. Do not open new decision
packets for execution discomfort; a genuinely new nondeterministic destination
is a scope event recorded against this frame.

## Falsifiers And Reframe Triggers

- If the import census cannot cover at least ninety-five percent of observed
  strategy imports with the ruled dependency classes and named red rows, the
  law is premature: narrow the assertion or split the ratchet.
- If Injected violation proof is impossible for a claimed failure class, the
  closure receipt must name why, the fallback proof, and the narrowed claim.
- If law-correction rows come to outnumber defined-destination rows, stop and
  reframe; the selected depth is wrong.
- If enforcing support-directory grammar lights up surfaces owned by other
  kinds (stage visualization, projection, adapters), those rows are exterior
  by definition; track them, do not absorb them.

## NOT HOW

This frame does not prescribe the slice count, agent lane names, the exact
GritQL or `structure.toml` implementation, or the order of burn-down within a
locked destination class. Those belong to this workstream's execution plan
once the runway is clear and the decision packets are ruled.
