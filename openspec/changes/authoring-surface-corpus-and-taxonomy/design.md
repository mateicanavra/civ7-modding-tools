# Design: Standard Recipe Authoring Surface Corpus And Taxonomy

## Approach

The corpus ledger reads `STANDARD_STAGES` directly and walks each stage
`surfaceSchema`. This keeps the ledger aligned with TypeBox-derived schema
objects, public+compile surfaces, internal-as-public step schemas, raw op
envelopes, and current defaults/ranges/enums.

The ledger records four layers:

- `knob`: `stage.knobs` fields.
- `public`: declared public stage schema fields that are not raw op envelopes.
- `internal-as-public`: step schema fields surfaced because the stage has no
  public schema.
- `internal-envelope`: raw op envelope rows or low-level `config` descendants.

For multi-strategy op envelopes, the ledger records config descendants under
`strategies.<strategy>.config.*` paths. This preserves which strategy owns each
field and prevents shared key names from collapsing into duplicate ledger rows.

The ledger also records Studio focus paths separately from schema fields because
`configFocusPathWithinStage` is a generated UI addressing contract, not a
runtime config field.

This slice records but does not solve defects. Later cleanup slices must use the
taxonomy and proof gates to choose one solution type per bucket before editing
behavior.

## Boundaries

The ledger may inspect:

- Standard recipe stages and step/op contracts.
- Generated schema/default artifact owners.
- First-party shipped config/preset owners.
- Studio schema/default/focus path consumers.
- Compiler/runtime read sites.

The ledger must not:

- Change stage schemas or compile behavior.
- Generate or update map artifacts.
- Migrate shipped configs.
- Add compatibility shims or wrapper config shapes.

## Review Lanes

- Architecture: verify flat stage shape, owner layer, and truth/projection
  boundaries.
- Product: verify issue buckets map to gameplay-meaningful decisions.
- OpenSpec: verify this slice is diagnostic and downstream slices remain
  bounded.
- TypeBox/TypeScript: verify schema walking reflects the current runtime
  schema objects.
- Operational debugging: verify no runtime proof is claimed for this
  behavior-neutral slice.
- Peer agent: adversarially check corpus completeness and taxonomy fit before
  dependent cleanup branches start.
