## Why

`grit-domain-deep-import` is one of the current 22 enforced Grit check rules.
It protects a load-bearing MapGen architecture boundary: recipe and map source
must consume domain public surfaces rather than deep domain internals.

Current checkpoint evidence repairs the native `ops-by-id` predicate gap,
expands native fixture coverage, reconciles the row metadata with the Grit
`.ts`/`.tsx` filename predicate, and records parser-grade live inventory over
recipe/map roots. That is still not enough to close the row as complete.
After restacking onto the accepted scaffold repair base, current shared wrapper
selector/current-tree, baseline file/integrity, and injected-probe API proof are
inherited only through `HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
`HGPR-PER-RULE-SELECTORS-2026-06-15`,
`HGPR-BASELINE-FILES-2026-06-15`,
`HGPR-BASELINE-INTEGRITY-2026-06-15`, and
`HGPR-INJECTED-GRIT-ROWS-2026-06-15`. Raw direct Grit acquisition remains
explicitly unclaimed through `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`. DDI-specific
generated-output remediation, relative local-domain reach disposition, apply
safety, retired parity, broader public-surface closure, and product/runtime
proof remain non-claims.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/research/official-docs-gritql.md`
- `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `.grit/patterns/habitat/checks/domain_deep_import.md`
- `tools/habitat-harness/src/rules/rules.json`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-grit-apply-deep-import-public-surface-proof/**`
- official Grit CLI, testing, target-language, and pattern documentation

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-domain-deep-import`.
- Specify that this workstream owns the check proof for recipe/map deep domain
  imports of `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and
  `strategies/<tail>`.
- Repair `ops-by-id` for native Grit predicate/fixture proof; current
  restacked shared wrapper/injected proof is represented only by accepted HGPR
  shared proof ids, while DDI-specific path-control and closure remain
  non-claims.
- Define the exact proof classes needed before the row can leave pending
  status in the aggregate Grit proof matrix.
- Require fixture expansion beyond the current default-import sample:
  named imports, type imports, namespace imports, re-exports, map paths,
  `ops-by-id`, `rules`, `strategies`, public-domain negatives, and path-control
  negatives.
- Define false-positive boundaries with `grit-recipe-domain-surface`,
  `grit-step-contract-domain-surface`, and
  `deep_import_to_public_surface`.
- Record the alias-only boundary: this rule matches `@mapgen/domain/...`
  specifiers, not relative reaches into `mods/mod-swooper-maps/src/domain/...`.
- Require explicit empty baseline proof for
  `tools/habitat-harness/baselines/grit-domain-deep-import.json`.
- Reconcile metadata/predicate scope: registry scope, Grit filename predicate,
  corpus-ledger scan roots, and native fixtures now agree on `.ts` and `.tsx`
  treatment.
- Require explicit duplicate-diagnostic ownership disposition with
  `grit-recipe-domain-surface` and step-contract checks before injected proof
  can be accepted as row-level closure.
- Require test-path scope classification for recipe/map-local `__tests__`,
  `__type_tests__`, `*.test.ts`, and external `test/**` paths.
- Require any DDI-specific injected violation/path-control proof to use the
  accepted shared injected-probe API instead of ad hoc probe creation.

## What Does Not Change

- No new rule is introduced.
- No source import is rewritten by this packet.
- No generated map file is edited or used as an injected probe target.
- No old mechanism is retired by this packet.
- No product/runtime Civ7 behavior is claimed from this structural check.
- No apply safety is claimed from this check row.

## Owner Boundary

This workstream owns:

- check-rule authority and proof for `grit-domain-deep-import`;
- fixture model and false-positive model for this rule;
- current-tree and injected violation proof requirements;
- baseline requirement for this rule;
- downstream proof-record alignment.

This workstream does not own:

- exact safe rewrites from `ops/<tail>` to public `/ops`; those belong to
  `habitat-grit-apply-deep-import-public-surface-proof`;
- broader recipe import public-surface policy; that belongs to
  `grit-recipe-domain-surface`;
- relative recipe reaches into local `src/domain/**`; those need a sibling
  guard or an accepted non-claim in the aggregate domain-surface family;
- stage contract import policy; that belongs to
  `grit-step-contract-domain-surface`;
- external test-only deep import policy outside recipe/map roots; recipe/map
  local test paths remain in this packet until the accepted scope decision says
  otherwise;
- generated map source repair; generated outputs are repaired through their
  generator/build owner.

## Effect Decision For This Slice

This packet is design/specification. Implementation of row-level injected
probes, adapter command provenance, parser classification, pattern projection,
and cleanup SHALL consume `habitat-effect-grit-adapter` or an accepted typed
Grit adapter substrate.

The current manual Grit runner is part of the evaluated failure surface because
it combines report acquisition, JSON extraction, cache reuse, and pattern
projection without typed failure classes. If a non-Effect substrate is proposed
for this row, it must prove the same properties that make Effect attractive
here: tagged failures, service-injected tests, explicit command provenance,
scan-root provenance, resource cleanup, and runtime-edge discipline.

Fixture edits and proof matrix documentation can proceed before that substrate.
Code that adds scan-root injection, fake command services, raw JSON parser
classifications, or cleanup/finalizer behavior waits for the accepted adapter
substrate.

## Requires

- Aggregate Grit proof repair remains the owner of the shared proof matrix.
- `habitat-effect-grit-adapter` or equivalent typed Grit adapter substrate
  before injected-probe implementation, with a recorded Effect/no-Effect
  substrate decision.
- `habitat-oclif-entrypoint-repair` before final selector-truth proof for
  wrong namespace or unknown selector cases.

## Enables Parallel Work

- `habitat-grit-proof-recipe-domain-surface` can reuse this packet's authority
  split while owning broader recipe-only non-public domain imports.
- `habitat-grit-apply-deep-import-public-surface-proof` can consume this
  packet's live match inventory and check/apply boundary.
- Aggregate Grit proof repair can link this packet as the row-specific proof
  source.

## Affected Owners

- `.grit/patterns/habitat/checks/domain_deep_import.md`
- `tools/habitat-harness/src/rules/rules.json` only if rule metadata needs
  precision changes
- `tools/habitat-harness/baselines/grit-domain-deep-import.json`
- Grit adapter/probe tests under `tools/habitat-harness/test/**` after the
  adapter substrate lands
- `openspec/changes/habitat-grit-proof-repair/**`
- this packet's `workstream/**`

## Protected Owners

- generated map outputs under `mods/mod-swooper-maps/src/maps/generated/**`;
- domain implementation files unless controlled test fixtures are owned by the
  accepted probe harness;
- `.civ7/outputs/resources/**`;
- lockfiles and dependency changes, unless owned by the adapter substrate
  packet.

## Stop Conditions

- The rule cannot distinguish its exact deep-domain internals from public
  `/ops`, `/config.js`, or domain-root imports with documented Grit semantics.
- Exact `ops-by-id` stops reporting through native Grit, or lookalike
  specifiers such as `ops-by-identity`, `ops-by-id-extra`, or
  `ops-by-id/private` start reporting. Any wrapper `ops-by-id` projection claim
  must cite the accepted shared selector/injected proof ids or remain an
  explicitly row-specific non-claim.
- The rule registry metadata, corpus ledger, and Grit filename predicate
  disagree about `.ts` and `.tsx` reach without an accepted alignment decision.
- Recipe/map-local test paths report unintentionally or are excluded
  unintentionally, with no accepted test-scope decision.
- Fixture expansion reveals that `import type`, namespace import, re-export, or
  `.tsx`/map path cases do not match the intended rule semantics.
- The rule duplicates `grit-recipe-domain-surface` or
  `grit-step-contract-domain-surface` without a distinct scan root or proof
  responsibility.
- Current-tree proof finds live violations and no owner accepts remediation or
  baseline policy.
- Current-tree proof finds relative `src/domain/**` reach-ins and downstream
  records attempt to claim complete domain public-surface enforcement from this
  alias-only row.
- Injected proof would require writing generated outputs or leaving probe files
  in the tree.
- The implementation needs adapter parsing, scan-root injection, command
  provenance, or cleanup behavior before the accepted adapter substrate exists.
- The implementation builds injected proof through ad hoc file creation,
  string-only Grit parsing, or cleanup by convention after the substrate
  decision says typed adapter behavior is required.

## Consumer Impact

After implementation, agents can trust this rule as a check-level proof that
recipe/map code does not deep-import the named alias-based domain internals.
They cannot infer from this rule that any rewrite is safe, that public exports
exist for private symbols, that relative local domain reaches are governed, or
that test code follows the same import policy.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-domain-deep-import --strict`
- `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter domain_deep_import --json`
- `bun run habitat:check -- --json --rule grit-domain-deep-import`
- bounded direct raw Grit check over recipe/map roots
- parser-grade current-tree import inventory for the rule predicate
- native fixture coverage matrix
- registry/predicate/corpus scope reconciliation
- neighboring-rule overlap disposition
- alias-only and relative local-domain reach disposition
- `ops-by-id` positive and lookalike-negative proof
- recipe/map-local test scope disposition
- injected recipe positive proof
- injected map positive proof outside generated output
- outside-scope path-control proof
- explicit empty baseline proof
- downstream aggregate matrix alignment
- `bun run openspec:validate`
