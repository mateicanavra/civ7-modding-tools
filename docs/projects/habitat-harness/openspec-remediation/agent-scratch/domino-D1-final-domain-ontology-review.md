# D1 Final Domain/Ontology Review

## Scope

Final domain/ontology adversarial review for:

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary`

This review treats D1 as one design/specification packet. It does not implement code, repair downstream packets, or perform broad corpus terminology cleanup.

Required inputs were read in full: Domain Design, Information Design, Ontology Design including all referenced files in its directory, the repo-local TypeScript refactoring corpus relevant to naming/state-space collapse, all D1 packet files, the D1 domain/code/testing investigations, and the accepted D0 packet including final D0 review.

## Verdict

Not accepted for design/specification yet.

D1 is substantially repaired: it correctly rejects a generic proof-artifact domain, treats inherited proof/evidence names as compatibility facts, defines bounded target families, names canonical non-claims, preserves the D0-before-source-edit gate, and keeps D15 conditional. The remaining domain/ontology issues are narrow, but they still leave implementation or downstream agents with vocabulary decisions that should be settled before acceptance.

## P1 Findings

None.

## P2 Findings

### P2 - D0 action/state vocabulary is still mixed with D1 strategy terminology

References:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/proposal.md`, "What Changes", line 31.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, "D0 Surface Dependency Inventory", lines 65-75.
- Accepted D0 baseline: `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`, "State Glossary" and "Compatibility Handling Semantics", lines 177-213.

D1 correctly states the closed D0 handling set in several places, but two rows still blur the ontology:

- `proposal.md:31` says adapter proof names are legacy public surfaces unless D0 classifies them "internal, document-only, generated-only, or versionable." That mixes a D0 contract state idea (`package-internal`), D0 handling actions (`document-only`, `generated-only`), and a non-D0 adjective (`versionable`) in one classification phrase.
- `design.md:74-75` place "no D1 action; D3/D4 must choose..." and "no D1 action; D8/D13 must choose..." inside a column named `Required D0 handling`. Those are valid D1 dispositions, but they are not D0 `compatibility_handling` values.

Why this matters: D0's accepted ontology deliberately separates `contract_state`, `compatibility_handling`, `target_owner`, and downstream redesign. D1's target strategy terms can exist, but not in a column or sentence that readers parse as D0 handling. Otherwise the closed D0 action set leaks into an informal "no action/versionable/internal" vocabulary.

Required repair:

Keep four concepts separate everywhere:

- D0 `contract_state`: e.g. `package-internal`, `command-only-dto`, `docs-example`, `generated-derived`.
- D0 `compatibility_handling`: exactly `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`.
- D1 target strategy/disposition: e.g. legacy wrapper, target rename, internal rename, downstream-owned, no D1 source edit.
- Owning downstream packet.

Concretely, rewrite `proposal.md:31` to use D0's exact terms, and split `design.md:74-75` so the D0-handling cell is either `blocked-pending-d0-row` / "must be copied from D0 row before implementation" or a closed D0 value, while "no D1 source edit" moves to a D1 disposition/protection column.

### P2 - Relationship ontology has typed names but underdefined endpoint classes

References:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, "Target Semantic Objects", lines 13-28.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, "Relationship Ontology", lines 90-109.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md`, "Typed Relationships Replace Untyped Handoff Links", lines 176-192.

The relation names are good enough to prevent an untyped `downstreamLinks` bag, but several endpoints are not defined as D1 semantic objects or D0 row identities:

- `records-execution-of` targets "command invocation", but the packet defines `CommandExecutionRecord`, not a stable `CommandInvocation` object or identity.
- `observes-post-state` targets "git/resources/tree observation", but `PostStateObservation` or equivalent is not a target object.
- `hands-off-to` targets "downstream record/workflow", which is too broad for an operational relation unless the allowed downstream endpoint families are named.
- `refuses-request` targets "request/surface", which crosses from runtime requests to D0 surfaces without distinguishing request identity from public-surface identity.
- `wraps-compatibility-surface` targets "Legacy public DTO/name", which should be grounded in a D0 `surface_id` when public.

Why this matters: ontology relationships do the work. A typed predicate with vague endpoint classes is still a thin arrow. Implementation agents can still invent whether a post-state observation is a record, a field, a Git command digest, a resource snapshot, or a D0 row link.

Required repair:

Add a small endpoint vocabulary or extend the target object table with the missing endpoint classes:

- `CommandInvocation` or state that the target is represented by a `CommandExecutionRecord` identity.
- `PostStateObservation` with allowed observed domains such as git status, resources, tree, or Graphite base provenance.
- `DownstreamHandoffTarget` with allowed target families or a rule that external/public targets cite D0 rows.
- `RefusedRequest` versus `D0 surface_id`, so refusal of a request is not confused with compatibility classification of a public surface.
- `LegacyCompatibilitySurface` as a D0-backed public surface identity, not a free DTO/name string.

Then update the relationship table so every relation has allowed source and target endpoint classes, not prose-only endpoint descriptions.

### P2 - Family ownership is directionally right but not single-authority sharp for diagnostics and adapter capture

References:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`, "Owner Map", lines 47-59.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/proposal.md`, "Affected Owners", lines 62-70.
- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/downstream-realignment-ledger.md`, downstream table, lines 7-19.

D1 no longer claims one giant receipt owner, which is the important repair. The remaining issue is that two owner rows still name composite or provisional authorities:

- `Check report and diagnostics` is owned by "Check/diagnostic boundary, later D6/D7 refinements" while owning "Rule report and diagnostic shape." That leaves unclear whether D1/check owns only report containment and validation shape, or whether D6/D7 own diagnostic taxonomy and status semantics.
- `Adapter command capture` is owned by "Adapter/command capture constrained by D1", but no concrete owner packet/domain is named. The packet also says D15 is not triggered unless a shared substrate emerges, so adapter capture needs a local owner now.

Why this matters: domain ownership cannot be "boundary plus later refinements" if an implementation agent must decide who approves a semantic change. D1 can constrain downstream owners, but each family still needs one current authority for design/spec purposes.

Required repair:

Split or sharpen the owner rows:

- `CheckReport` ownership: report containment, summary state, and `ok`/rule-status consistency.
- `Diagnostic` ownership: D1 owns only containment/non-claim rules; D6/D7 own diagnostic taxonomy/severity/rule semantics, if that is the intended boundary.
- Adapter capture ownership: name the concrete owner as adapter command capture / current adapter artifact owner / future D15 only if triggered. Do not leave it as "Adapter/command capture" without a packet/domain authority.

## P3 Findings

### P3 - One normative spec scenario uses target-suspect evidence language

Reference:

- `openspec/changes/deep-habitat-d1-receipt-contract-boundary/specs/habitat-harness/spec.md`, "Unsupported apply change", lines 172-174.

The scenario says "apply evidence includes outside-root paths..." D1 elsewhere says broad `Evidence` in DTO names should become `Observation`, `Digest`, `ChangeDigest`, `CommandOutput`, or `Citation` unless it is raw source evidence (`design.md:42`). Here the term appears in normative target spec language and is probably not raw source evidence; it is an apply change observation/diff observation.

Suggested repair: rename the phrase to "apply change observation", "diff observation", or "apply change record" unless D1 explicitly means raw source evidence.

## Explicit D0 Action Vocabulary Check

Not clean.

Passes:

- D1 repeatedly names the closed D0 handling set exactly: `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, `generated-only` (`proposal.md:47`; `design.md:31`; `tasks.md:13`; `phase-record.md:39`; `spec.md:10`).
- D1 usually separates implementation strategy terms such as wrapper/rename from D0 handling (`design.md:31`; `proposal.md:47`).

Failures:

- `proposal.md:31` uses non-D0/mixed classification terms "internal" and "versionable" alongside D0 handling actions.
- `design.md:74-75` put "no D1 action..." in a `Required D0 handling` column.

No source implementation should rely on those phrases until repaired.

## Explicit D1 Source-Implementation Block Check

Pass.

D1 source implementation remains blocked until actual D0 matrix rows exist:

- `proposal.md:43-60` says D1 implementation is blocked until every affected public or durable surface has a D0 `surface_id`, plane, compatibility handling, target owner, and downstream citation.
- `design.md:61-75` uses `blocked-pending-d0-row` placeholders and says implementation must complete concrete D0 row citations before source edits.
- `tasks.md:8`, `tasks.md:12-14`, and `tasks.md:54` require stopping before source edits if D0 rows are missing.
- `phase-record.md:34-39` records D0 design/spec as accepted but D0 matrix implementation as required before D1 source edits.
- `closure-checklist.md:15-22` keeps concrete D0 rows as implementation prerequisites.

This review does not accept the future D0 matrix implementation.

## Repair Requirements

Before D1 is marked accepted for design/specification:

1. Repair the D0 vocabulary mixing in `proposal.md:31` and `design.md:74-75`.
2. Add or sharpen endpoint classes for D1 relationships so relation targets are operational semantic objects, not broad prose labels.
3. Sharpen the owner map for `CheckReport` versus `Diagnostic` authority and for adapter command capture ownership.

Optional but recommended while editing:

4. Replace the normative "apply evidence" phrase with observation/digest/change-record language unless it is intentionally raw source evidence.

## Non-Claims

- This review does not implement D1.
- This review does not run Habitat tests or OpenSpec validation.
- This review does not review broad downstream packet correctness.
- This review does not accept D0 matrix implementation.
- Current code names remain present-behavior evidence, not target domain authority.

Skills used: domain-design, information-design, ontology-design, typescript-refactoring.
