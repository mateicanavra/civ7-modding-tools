## Why

`grit-contract-export-all` is one of the current 22 enforced Grit check rules.
It protects explicit contract and public-surface shape: value surfaces should be
published through named exports, while type-only aggregation through
`export type *` remains allowed.

Current closure evidence shows the active rule is registered, has passing
native fixtures for its value-star predicate classes, passes through the
Habitat wrapper and aggregate `grit-check` selector with zero diagnostics, has
an explicit empty baseline, and has a registered injected violation/path-control
probe. Type-star allowance is proven through current-tree inventory plus the
wrapper zero-diagnostic run because the pinned native Markdown fixture parser
does not accept `export type *` syntax. Current taxonomy also ties this rule to
domain-root `export *` facades, while the current Grit predicate does not cover
live domain-root/config/index value-star facades. This checkpoint separates the
active CEA row closure from those broader domain-surface promises.

This change closes the active CEA check row inside that boundary. It does not
change source exports, broaden the predicate to domain-root facades, or claim
raw acquisition, parity, apply safety, or product/runtime proof.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/research/official-docs-gritql.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `openspec/changes/habitat-grit-catalog/**`
- `openspec/changes/habitat-enforcement-consolidation/**`
- `openspec/changes/habitat-grit-proof-repair/**`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `.grit/patterns/habitat/checks/contract_export_all.md`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-contract-export-all`.
- Specify that this workstream owns check proof for bare value `export *` in
  the current effective predicate:
  - step contract files under recipe stage step roots;
  - domain op `contract.ts`, `types.ts`, and `index.ts` files;
  - domain op `rules/**` and `strategies/**` implementation files.
- Record proof that named exports remain native controls and `export type *`
  remains allowed through current-tree inventory plus Habitat wrapper zero
  diagnostics.
- Require a domain-root facade disposition before downstream records can claim
  this row proves all `scope:domain-surface` export-star hygiene.
- Require fixture expansion beyond the current single value-star positive and
  named-export negative.
- Keep current-tree proof classes separate: native sample, Habitat wrapper,
  wrapper scan-root truth, live inventory, injected violation, baseline, old
  mechanism parity, raw acquisition, and downstream realignment.
- Require explicit empty baseline proof for
  `tools/habitat-harness/baselines/grit-contract-export-all.json`.
- Record injected violation proof through the accepted registered probe runner.

## What Does Not Change

- No new rule is introduced.
- No export statement is rewritten by this packet.
- No domain-root facade is repaired by this packet.
- No generated output is edited or used as an injected probe target.
- No product/runtime Civ7 behavior is claimed from this structural check.
- No apply safety is claimed from this check row.

## Owner Boundary

This workstream owns:

- check-rule authority and proof for `grit-contract-export-all`;
- fixture model and false-positive model for this rule;
- current-tree and injected violation proof requirements;
- baseline requirement for this rule;
- downstream proof-record alignment.

This workstream does not own:

- cross-file named export synthesis from a value-star source;
- exact export-list rewrite safety;
- domain-root facade repair unless implementation explicitly expands this rule
  or links sibling implementation/proof ids;
- SDK/package barrel export policy outside the current predicate;
- generated output repair.

## Injected-Probe Decision For This Slice

This packet consumes the accepted registered injected-probe runner for
row-specific CEA proof. It does not claim Effect adapter implementation proof
from this row.

The current manual Grit runner is part of the evaluated failure surface because
row closure needs exact pattern projection, parser-edge classification, and
probe cleanup. Local Effect adoption research identifies Grit adapter hardening
as a strong fit for Effect because the work needs typed command acquisition,
JSON parse classification, scan-root provenance, pattern projection, baseline
application, diagnostic projection, and scoped cleanup. If a non-Effect
substrate is proposed for this row, it must prove the same properties that make
Effect valuable here: tagged failures, service-injected tests, explicit command
provenance, scan-root provenance, resource cleanup, runtime-edge discipline,
and parser-classified outputs.

The registered CEA injected proof covers one domain-op value-star probe and a
domain-root outside-scope path control. Native fixtures, not the injected
runner, cover the step-contract and rules/strategies syntax branches in this
checkpoint.

## Requires

- Aggregate Grit proof repair remains the owner of the shared proof matrix.
- Broader domain-root facade closure requires predicate expansion proof or a
  sibling accepted implementation/proof id.
- Retired old-mechanism parity requires a separate parity proof.
- Export-list rewriting requires a separate apply/codemod proof.

## Enables Parallel Work

- `habitat-grit-proof-domain-root-facades` or a refined existing row can own
  domain-root `export *` facade coverage if this row stays scoped to contract
  and op-local surfaces; complete domain-surface claims still require linked
  implementation/proof ids.
- `habitat-grit-apply-helper-redeclarations` and any export-list rewrite packet
  can consume this row's live inventory while owning rewrite proof separately.
- Aggregate Grit proof repair can link this packet as the row-specific proof
  source.

## Affected Owners

- `.grit/patterns/habitat/checks/contract_export_all.md`
- `tools/habitat-harness/src/rules/rules.json` only if metadata needs precision
  changes
- `tools/habitat-harness/baselines/grit-contract-export-all.json`
- Grit adapter/probe tests under `tools/habitat-harness/test/**` after the
  adapter substrate lands
- `openspec/changes/habitat-grit-proof-repair/**`
- this packet's `workstream/**`

## Protected Owners

- generated outputs;
- product/runtime source outside controlled probe fixtures;
- SDK/package barrel export policy outside this row;
- lockfiles and dependency changes, unless owned by the adapter substrate
  packet.

## Stop Conditions

- The rule cannot distinguish value `export *` from `export type *` in the
  accepted proof path.
- Native fixtures or adapter proof cannot cover the `export type *` allowance.
- `export * as name from ...` or other parser-edge exports remain unclassified.
- Registry metadata, taxonomy, corpus rows, and the Grit filename predicate
  disagree about whether domain-root facades are in this row.
- Domain-root facade disposition is only a label, with no predicate expansion
  proof, no sibling implementation/proof ids, and no downstream downgrade that
  names the remaining blocked owner.
- Current-tree proof finds live in-scope value-star violations and no owner
  accepts remediation or baseline policy.
- Injected proof would require writing generated outputs or leaving probe files
  in the tree.
- The implementation builds injected proof through ad hoc file creation,
  string-only Grit parsing, or cleanup by convention after the substrate
  decision says typed adapter behavior is required.

## Consumer Impact

After implementation, agents can trust this row as a check-level proof that the
current effective contract/op-local surfaces do not use bare value
`export *`. They cannot infer from this row that named export synthesis is safe,
that all domain-root public facades are covered, or that package barrels outside
the current predicate follow the same policy.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-contract-export-all --strict`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter contract_export_all --json`
- `bun run habitat:check -- --json --rule grit-contract-export-all`
- exact Habitat wrapper scan-root inventory
- live `export *` / `export type *` inventory for in-scope and out-of-scope
  paths
- native fixture coverage matrix or accepted parser-edge adapter proof
- domain-root facade disposition
- aggregate `grit-check` wrapper proof
- registered injected domain-op positive proof
- outside-scope path-control proof
- explicit empty baseline proof
- downstream aggregate matrix and corpus realignment
- `bun run openspec:validate`
