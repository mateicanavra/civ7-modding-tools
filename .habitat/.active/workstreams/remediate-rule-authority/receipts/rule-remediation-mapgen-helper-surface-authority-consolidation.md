# Rule Remediation: MapGen Helper Surface Authority Consolidation

Status: Layer 2 decision packet complete; Layer 3 entry warrant recorded.

Canonical operational record:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`.

## Purpose

Create the Layer 2 decision packet for the helper-surface authority slice:

- `prohibit_runtime_helper_redeclarations`
- `prohibit_foundation_duplicate_math_helper_redefinitions`

This packet supersedes the earlier conclusion that the Foundation helper rule
was settled as narrow Foundation-local authority. The broader authority is real,
but it is not "all helpers move to core." The correct implementation slice is a
bounded consolidation around exact-equivalent shared helper redeclarations,
with explicit exclusions for semantically distinct domain-local helpers.

## Authority Inputs

- `.habitat/.active/frames/RULE-REMEDIATION-WORKSTREAM-FRAME.md`
- `.habitat/.active/frames/RULE-DECISION-PACKET-FRAME.md`
- `.habitat/.active/workstreams/establish-mapgen-product-authority/MAPGEN-PRODUCT-AUTHORITY-FRAME.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/reviews/_archive/REVIEW-M7-recipe-compile-cutover.md`
- `docs/projects/engine-refactor-v1/issues/_archive/LOCAL-TBD-M7-U15-post-u14-canonical-exemplar-and-domain-op-decomposition.md`
- `packages/mapgen-core/src/core/index.ts`
- `packages/mapgen-core/src/lib/math/**`
- `mods/mod-swooper-maps/src/domain/**`
- `mods/mod-swooper-maps/src/recipes/**`

## Source Facts

`@swooper/mapgen-core` already exposes generic shared helpers:

- root export: `clamp`, `clamp01`, `clampInt`, `clampPct`,
  `clampChance`, `rollPercent`, `lerp`, `normalizeRange`;
- `@swooper/mapgen-core/lib/math`: additionally exposes `clampU8`,
  `clampFinite`, `clampInt16`, `roundHalfAwayFromZero`,
  `wrapDeltaPeriodic`, and `wrapAbsDeltaPeriodic`.

The current runtime helper rule covers recipe step files and domain operation
strategy files for only `clamp01`, `clampChance`, `normalizeRange`, and
`rollPercent`. That is under-scoped relative to current visible helper pressure.

The current Foundation helper rule covers selected Foundation op files for
`clampByte`, `addClampedByte`, `clamp01`, `clampInt8`, and `normalizeToInt8`.
That rule is protecting a local Foundation tectonics helper surface, not proving
that all byte/int8/vector quantization helpers belong in MapGen core.

## Decision Packets

### `prohibit_runtime_helper_redeclarations`

Current path:
`.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json`

Current placement:
`blueprint=_self; niche=civ7/mapgen/sdk/core; category=boundary; operation=check`

Input classification:
`positive authority creation`

Source files inspected:

- `.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json`
- `.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/pattern.md`
- `.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md`
- `packages/mapgen-core/src/core/index.ts`
- `packages/mapgen-core/src/lib/math/*.ts`
- `mods/mod-swooper-maps/src/domain/**`
- `mods/mod-swooper-maps/src/recipes/**`

Clause table:

| Clause | Evidence inspected | Owner | Forbidden owner / false destination | Proof class | Action fit | Packet disposition |
| --- | --- | --- | --- | --- | --- | --- |
| Recipe step and op strategy files must not redeclare exact-equivalent core helpers `clamp01`, `clampChance`, `normalizeRange`, or `rollPercent`. | Existing Grit rule, core helper exports, source grep over recipes/domain strategies. | MapGen core helper surface, enforced by Habitat source rail. | Recipe step and op strategy implementation files. | source absence proof plus focused Habitat check. | consolidate and widen. | Preserve rule id as the survivor rail, but update destination wording to allow root or `lib/math` public core helper imports. |
| The rule currently misses helper declarations in domain `rules/`, domain-local helper modules, and selected recipe helper files. | Source grep found Hydrology `rules/index.ts`, Morphology shared rules, Foundation shared tectonics, recipe helper files. | Mixed: exact-equivalent generic helpers belong to MapGen core; domain-specific transforms remain local. | A single broad catch-all "all helpers" rule. | manual source judgment plus future focused Habitat proof. | split by semantic equivalence. | Layer 3 may widen only to exact-equivalent generic helpers; non-equivalent helpers are excluded. |
| Auto-apply replacement for exact `clamp01` forms exists. | `apply.pattern.md`; prior runtime-helper source slice. | Habitat packet-local Grit fix rail. | Package-owned tests or MJS rewrite. | runner/support path proof plus focused Habitat check. | keep with scope repair. | Keep Grit as native pattern rail; no package tests. |

Remediation action:
`positive authority creation` through a widened exact-equivalent helper-source rail.

Whole-rule fit:
Partial. The survivor rule is the right seed, but its current predicate and
message are too narrow.

Split needed:
Yes, by helper semantic equivalence. The split happens by implementation scope,
not by creating a new manifest category.

Positive authority candidate:
MapGen core exact-equivalent helper surface.

False authority rejected:
`shared-utils` dumping ground; package-owned tests; broad "all helpers" ban;
Foundation-local-only admission.

Destination / enforcement home:
Existing SDK/core rule packet should remain the survivor Habitat/Grit rail for
generic exact-equivalent helper redeclarations.

Rule id plan:
Preserve `prohibit_runtime_helper_redeclarations`.

Semantic remediation decision:
Widen this rule to cover exact-equivalent generic helper redeclarations across
the current MapGen source surfaces where the helper already has a public
MapGen core equivalent. Do not absorb semantically distinct local transforms.

Proof class / proof limit:
`source absence proof`, `runner/support path proof`, and focused Habitat checks.
This proof would not prove behavioral equivalence for byte/int8/vector helpers
or domain-specific transforms.

Required downstream record update:
Canonical JSON slice and rule rows; execution-surface docs only if rule paths or
runner files change during Layer 3.

Residual follow-up:
Repeated ecology `smoothstep`/`bandpass`, resources `hash32`/`hash01`, and
resources `compareRange` are separate helper-family candidates. They are not
authorized by this slice.

### `prohibit_foundation_duplicate_math_helper_redefinitions`

Current path:
`.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_duplicate_math_helper_redefinitions/rule.json`

Current placement:
`blueprint=_self; niche=civ7/mapgen/domains/foundation; category=boundary; operation=check`

Input classification:
`positive authority creation`

Source files inspected:

- `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_duplicate_math_helper_redefinitions/rule.json`
- `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_duplicate_math_helper_redefinitions/pattern.md`
- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`
- selected Foundation op files named by the manifest
- `packages/mapgen-core/src/lib/math/clamp.ts`
- `packages/mapgen-core/src/lib/math/int16.ts`

Clause table:

| Clause | Evidence inspected | Owner | Forbidden owner / false destination | Proof class | Action fit | Packet disposition |
| --- | --- | --- | --- | --- | --- | --- |
| Selected Foundation op files must not redeclare local clamp/math helper functions that should come from a shared surface. | Foundation rule manifest/pattern; current Foundation tectonics source. | Foundation tectonics helper surface for tectonic quantization helpers; MapGen core for exact generic helpers. | Treating all helper names as Foundation-only or core-only without semantic split. | source absence proof plus focused Habitat check. | consolidate under broader helper authority with exclusions. | Do not keep this as a standalone local proxy after the survivor rail is widened. |
| `clamp01` has an exact public MapGen core equivalent when non-finite fallback behavior matches. | Core `clamp01`/`clampPct`; prior runtime helper slice. | MapGen core helper surface. | Foundation op files. | source absence proof. | absorb. | Covered by the survivor generic helper rule when widened. |
| `clampByte`, `clampInt8`, and `normalizeToInt8` have Foundation-specific quantization semantics. | Foundation `lib/tectonics/shared.ts`; core `clampU8` and `clampInt` differ on rounding, infinity, and range. | Foundation tectonics helper surface unless a later source-backed core quantization helper is deliberately created. | Mechanical replacement with `clampU8` or a broad core helper assertion. | manual source judgment. | exclude from this implementation slice. | No Layer 3 mutation may absorb these into core without a separate semantic decision. |

Remediation action:
`positive authority creation` plus consolidation into the survivor helper rail.

Whole-rule fit:
Not as a standalone Foundation-local rule. It is a local proxy for broader
helper-surface authority, but some clauses are explicitly local-domain helper
authority.

Split needed:
Yes, by helper semantics. Exact generic helper clauses are absorbed by the
survivor rule; Foundation quantization/vector helpers are excluded.

Positive authority candidate:
MapGen core exact-equivalent helper surface, with Foundation tectonics helpers
kept as a separate local helper surface.

False authority rejected:
Blind core absorption of `clampByte`, `clampInt8`, and `normalizeToInt8`;
package-owned tests; keeping this proxy as a settled Foundation-only rule.

Destination / enforcement home:
The rule should be retired or absorbed during Layer 3 only after the survivor
helper rail covers any exact-equivalent generic helper recurrence risk. The
Foundation quantization helpers remain outside the survivor rail.

Rule id plan:
Delete `prohibit_foundation_duplicate_math_helper_redefinitions` without direct
replacement only if the Layer 3 widened survivor rule covers the exact generic
helper risk and explicitly excludes Foundation quantization helpers. Otherwise,
keep it packet-needed.

Semantic remediation decision:
This is not a final live Foundation rule. It is a proxy row that should not
survive once the broader exact-equivalent helper authority rail is widened.

Proof class / proof limit:
`source absence proof`, `focused habitat check`, and record reconciliation.
This does not prove or authorize moving Foundation tectonics quantization
helpers into MapGen core.

Required downstream record update:
Canonical JSON rule row and slice status. If Layer 3 deletes the Foundation
rule, live manifest and ledger coverage must reconcile.

Residual follow-up:
If the product later wants shared byte/int8/vector quantization helpers, that
requires a separate source-backed authority packet.

## Layer 3 Entry Warrant

Operational ledger path:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`

Selected rule ids:

- `prohibit_runtime_helper_redeclarations`
- `prohibit_foundation_duplicate_math_helper_redefinitions`

Source commit:
`dba8598fd52becb4022e86b5e6a1c81a4dde094d`

Selected slice id:
`mapgen-helper-surface-authority-consolidation`

Selected slice receipt path:
`.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-mapgen-helper-surface-authority-consolidation.md`

Fresh packet reviewer disposition:
approve-with-repairs; P1/P2 findings were record-state repairs only and were
accepted. The canonical JSON records the repaired Layer 3 entry warrant.

No selected row stale or contradicted:
true after this packet, subject to fresh packet review.

Explicit excluded adjacent rows:

| Excluded surface | Reason |
| --- | --- |
| Foundation `clampByte`, `clampInt8`, `normalizeToInt8` local helper semantics | They differ from current core helpers in rounding, infinity handling, and numeric range. |
| Hydrology `lerp01`, threshold transforms, `clampMin`, and directional helper families | These are domain-local or operation-local transforms, not exact core-helper clones. |
| Ecology `smoothstep`/`bandpass` helper family | Repeated and likely positive-authority pressure, but not covered by the selected rule ids. |
| Resources `hash32`/`hash01` and `compareRange` helper families | Repeated and likely positive-authority pressure, but separate from the current helper slice. |
| Recipe/local byte clamps such as `clampI8` and `clampToByte` | Their exact signed/range semantics differ from the generic helper rule. |

Actions not authorized:

- moving byte/int8/vector quantization helpers into MapGen core;
- creating a broad shared-utils owner;
- adding package-owned tests for helper redeclaration residue;
- mutating product source before the Layer 3 slice frame is entered;
- changing unrelated helper-family rows not selected here.

Exact next legal action:
Enter Layer 3 for one bounded slice that widens/polishes the existing
`prohibit_runtime_helper_redeclarations` Habitat/Grit rail for exact-equivalent
MapGen core helper redeclarations, then absorbs or deletes
`prohibit_foundation_duplicate_math_helper_redefinitions` only to the extent
covered by that widened survivor rail.
