# Phase Record - Domain Deep Import Proof

## Selection

Selected workstream: `habitat-grit-proof-domain-deep-import`.

Reason: this row owns the alias-based `grit-domain-deep-import` check that keeps
recipe/map code on public domain surfaces rather than deep internals. It remains
separate from `deep_import_to_public_surface`, which owns any safe rewrite/apply
proof.

## Systematic Gates

### Gate 1 - Frame

Objective, hard core, exterior, falsifier, owner boundary, stop conditions, and
proof gates are recorded in `proposal.md` and `design.md`.

### Gate 2 - Repo State

Current checkpoint state:

- worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`;
- branch: `agent-HG-habitat-grit-domain-deep-import-side-effect-repair`;
- historical base at row start:
  `292c5eba9 test(habitat): expand sdk mapgen proof`;
- Graphite parent: `agent-HG-habitat-grit-sdk-mapgen-entrypoint`;
- current restacked HG bottom branch parent:
  `agent-HR-habitat-scaffold-contract-repair`;
- accepted shared wrapper selector, baseline, and injected-probe API proof is
  inherited through `HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
  `HGPR-PER-RULE-SELECTORS-2026-06-15`,
  `HGPR-BASELINE-FILES-2026-06-15`,
  `HGPR-BASELINE-INTEGRITY-2026-06-15`, and
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`;
- mode: product-bearing side-effect import false-negative repair checkpoint.

### Gate 3 - Diagnosis

Original packet evidence proved catalog presence but not row closure. It also
found an `ops-by-id` native predicate gap, recipe/map-local test-path reach, and
relative local-domain reaches outside this alias rule.

Current checkpoint repairs a static import false-negative: bare side-effect
imports from forbidden deep domain internals now report through the active DDI
rule. The prior `ops-by-id` repair remains intact.

### Gate 4 - Corpus

Corpus row source:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` row
  `grit-domain-deep-import`;
- aggregate matrix row in
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.

### Gate 5 - Grouping

This row belongs to the domain-surface family. It remains separate from
`grit-recipe-domain-surface` because this row includes map source and an exact
forbidden-source family under `ops`, exact `ops-by-id`, `rules`, and
`strategies`. It remains separate from `deep_import_to_public_surface` because
this row is a check, not an apply codemod.

### Gate 6 - Expectations

Expected current state for this checkpoint:

- native Grit fixtures report exact deep alias imports/re-exports;
- bare side-effect imports from forbidden deep alias sources report;
- source-prefix and source-protocol lookalikes remain clean controls;
- public domain root, public `/ops`, and `/config.js` imports remain clean;
- exact `ops-by-id` reports, while `ops-by-identity`, `ops-by-id-extra`, and
  `ops-by-id/private` remain clean;
- recipe/map-local tests are included by the current predicate;
- external test roots are outside this row;
- generated map files are scan evidence only, not authored probe targets;
- no live recipe/map forbidden alias candidates exist.

### Gate 7 - Architecture Translation

Owner: Grit check. Forbidden owners: apply codemod safety, generator repair,
runtime proof, raw adapter behavior, injected cleanup, and baseline mutation
safety.

### Gate 8 - Slice

Current slice is a side-effect import predicate repair plus row-specific proof
checkpoint. It does not close the full row because raw direct acquisition,
map/`ops-by-id`/generated-output path-control beyond this repaired import class,
relative local-domain reach disposition, apply safety, retired parity, broader
public-surface closure, and product/runtime proof remain non-claims.

## Evidence

- `DDI-SOURCE-AUTHORITY-2026-06-15`: source authority/registration record.
- `DDI-METADATA-SCOPE-2026-06-15`: metadata and Grit filename predicate align
  on `.ts`/`.tsx`.
- `DDI-NATIVE-FIXTURES-2026-06-15`: native Grit fixture/parser-edge proof.
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter domain_deep_import --json 2>&1`
  exited 0 with one testable pattern, 11 current-predicate positive matches,
  and 0 ignore-sample matches.
- `DDI-IMPORT-INVENTORY-2026-06-15`: parser inventory/live corpus evidence.
  TypeScript compiler API inventory over `mods/mod-swooper-maps/src/recipes`
  and `mods/mod-swooper-maps/src/maps` counted 241 scanned TS/TSX/JSON files,
  235 current-predicate `.ts` files, 0 `.tsx`, 7 generated map files in the
  current predicate, 125 domain-alias import declarations, 0 forbidden alias
  candidates, 83 public domain-root references, 12 public `/ops` references, 30
  public `/config.js` references, 2 map-local test files, 0 recipe-local test
  files, 6 relative local-domain reaches, and 0 parse diagnostics.
- `DDI-SIDE-EFFECT-PREDICATE-REPAIR-2026-06-16`: product repair. Static
  imports now use `import_statement(source=...)`; exact optional-quote source
  matching prevents source-prefix/protocol lookalikes; the registered injected
  probe exercises a side-effect import.
- `DDI-NATIVE-FIXTURES-2026-06-16`: native Grit fixture proof.
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter domain_deep_import --json`
  exited 0; the DDI sample produced 12 positive matches and 0 ignores.
- `DDI-IMPORT-INVENTORY-2026-06-16`: parser inventory/live corpus evidence.
  Current recipe/map roots contain 234 current-predicate `.ts` files, 0 `.tsx`,
  0 side-effect imports, 0 forbidden side-effect candidates, 0 total forbidden
  candidates, and 0 parse diagnostics.
- `DDI-PER-RULE-SELECTOR-2026-06-16`: `bun run habitat:check -- --json --rule grit-domain-deep-import`
  selected exactly DDI plus `baseline-integrity`, both passing.
- `DDI-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` passed with 30
  Grit rules plus `baseline-integrity`, DDI included.
- `DDI-BASELINE-FILES-2026-06-16`: 30 Grit rules, 30 explicit empty Grit
  baselines, no missing/extra/non-empty baselines, DDI included.
- `DDI-INJECTED-PROBE-2026-06-16`: clean-start injected proof exited 1 only
  because unrelated DDIT remains blocked; DDI passed with one diagnostic at the
  side-effect import probe path, a clean domain-source control, clean
  initial/final git state, and clean probe cleanup.

## Review / Findings

- `DDI-R1`: accepted and repaired for native fixture proof. Exact `ops-by-id`
  import and re-export now report; lookalikes stay clean. Current restacked
  shared wrapper/injected proof is inherited through accepted HGPR ids; any
  DDI-specific path-control or closure claim remains a non-claim.
- `DDI-R2`: accepted and repaired for native/parser record truth. Recipe/map
  local test paths are current-predicate scope; external tests are out of scope.
- `DDI-R3`: accepted as still gated. Recovery claim ledger closure is not
  claimed from this checkpoint because raw direct acquisition, DDI-specific
  injected/path-control closure, and broader public-surface proof remain
  non-claims even though current shared wrapper/baseline/injected proof ids are
  available after restack.
- `DDI-R4`: accepted as restacked shared proof. Baseline file and integrity
  evidence are represented by `HGPR-BASELINE-FILES-2026-06-15` and
  `HGPR-BASELINE-INTEGRITY-2026-06-15`; this row does not add a separate
  baseline-mutation claim.
- `DDI-R5`: accepted as non-claim input. Six relative local-domain reaches are
  outside this alias row and remain sibling guard/non-claim input.
- `DDI-R6`: accepted and repaired for product enforcement. The prior import
  snippet missed bare side-effect static imports; the rule now uses
  `import_statement(source=...)` and row-specific injected proof exercises that
  repaired import class.

## Current Status

- Side-effect import predicate repair implemented and committed on the local
  DDI Graphite layer.
- Parser inventory completed, rerun, and recorded with explicit current counts.
- Metadata scope aligned to `.ts`/`.tsx`.
- Aggregate corpus/proof/command records updated for this bounded checkpoint.
- Native Grit fixture proof, full native corpus proof, Habitat per-rule wrapper,
  aggregate `grit-check`, explicit empty baseline inventory, and clean-start
  injected proof all passed for the repaired side-effect import class. The
  injected runner still exits 1 only for accepted unrelated DDIT.
- Full row closure remains gated by raw direct acquisition, additional
  map/`ops-by-id`/generated-output path-control beyond this side-effect probe,
  relative local-domain reach disposition, apply safety, retired parity, broader
  public-surface closure, recovery-claim realignment, and product/runtime proof.

## Next Actions

1. Stop for supervisor review; do not open a second row.
