# Phase Record - Step Contract Domain Surface Proof

## Selection

Selected workstream: `habitat-grit-proof-step-contract-domain-surface`.

Reason: this is the next unpacketized domain-surface row in the Grit corpus
ledger after domain deep import, contract export, and recipe domain surface
packets. It closes a contract-specific boundary that would otherwise be hidden
inside ordinary recipe proof even though step contracts have a stricter source
policy.

## Systematic Gates

### Gate 1 - Frame

Objective, hard core, exterior, falsifier, owner boundary, stop conditions, and
proof gates are recorded in `proposal.md` and `design.md`.

### Gate 2 - Repo State

Initial state:

- branch: `codex/habitat-dra-takeover-frame`;
- latest commit before this packet:
  `ad2ecd928 docs(habitat): design recipe domain surface proof`;
- Graphite status: clean before this packet opened;
- worktree status: clean before this packet opened;
- active mode: design/specification, not implementation.

### Gate 3 - Diagnosis

Current evidence proves catalog presence and current pass state, but not
row-level closure:

- native fixture passes;
- wrapper rule selection passes;
- bounded raw check over the Swooper recipe root reports no results;
- live Swooper matching step contracts import domain roots only;
- current native fixture does not prove parser-edge forms, path controls, or
  neighboring overlap;
- current pattern can match lookalike filenames ending in `contract.ts`;
- current source regex can match prefixed or relative source strings that
  contain `@mapgen/domain/<domain>/<tail>`;
- raw Grit capability is broader than the current Habitat wrapper root;
- recipe-local test paths under `steps/**` are currently in raw predicate
  scope;
- injected violation and explicit baseline proof remain absent.

### Gate 4 - Corpus

Corpus row sources:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` row
  `grit-step-contract-domain-surface`;
- aggregate matrix rows in
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`;
- retired `eslint-step-contract-imports` invariant in
  `docs/projects/habitat-harness/invariant-corpus.md`.

### Gate 5 - Grouping

This row belongs to the domain-surface family but remains its own workstream
because step contracts allow only the domain root, while ordinary recipes allow
domain root, `/ops`, and `/config.js`.

### Gate 6 - Expectations

Expected current state before implementation:

- no live in-scope Swooper step-contract violations;
- exact domain-root imports remain allowed;
- any domain subpath in a matching step contract reports this row;
- `/ops` and `/config.js` are forbidden here even though ordinary recipes may
  use them;
- `ops/<tail>`, `rules/<tail>`, and `strategies/<tail>` may also report
  neighboring domain-deep diagnostics;
- star re-exports may also report contract-export diagnostics;
- `notacontract.ts`, source-specifier lookalikes, and recipe-local test paths
  require reviewed classification;
- other-mod raw capability must not be confused with current wrapper
  enforcement;
- injected positives should fail the exact Habitat rule id.

### Gate 7 - Architecture Translation

Owner: Grit check for step-contract domain-root-only imports.

Forbidden owners:

- ordinary recipe source policy except through boundary records;
- map-source source policy;
- stage artifact contract policy;
- automated import rewriting;
- generated output repair;
- runtime Civ7 behavior.

### Gate 8 - Slice

This OpenSpec packet is the slice. It defines write set, protected paths,
review lanes, tasks, downstream realignment, and closure evidence.

## Effect/Substrate Note

Injected proof implementation waits for `habitat-effect-grit-adapter` or an
accepted typed Grit adapter substrate because the probe harness needs scoped
file creation, command provenance, scan-root provenance, exact rule projection,
parser-edge classification, neighboring-rule overlap classification, and
cleanup proof.

The substrate decision is structural. If implementation chooses not to use
Effect for this row, the substitute must still provide tagged failures,
service-injected tests, command data, scan-root provenance, parser
classifications, overlap classification, and cleanup behavior.

## Current Status

- Packet opened.
- Local evidence recorded.
- Internal review findings accepted in the draft.
- External adversarial review completed with two accepted/repaired P2 findings.
- Implementation checkpoint now has native fixture and parser inventory proof;
  wrapper, raw/adapter, injected, baseline, parity, exact-scope, and product
  closure remain open.

## Implementation DRA Update - 2026-06-15

Branch:

- `agent-HG-habitat-grit-step-contract-domain-surface`

Parent layer:

- `agent-HG-habitat-grit-recipe-domain-surface` at
  `387913daf82826508b2bbb12c33a8dd35850a1c5`

Worktree:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`

Completed independent row work:

- Expanded `.grit/patterns/habitat/checks/step_contract_domain_surface.md`
  fixtures to cover 22 current-predicate positive classes and path/source
  controls inside the native Grit fixture contract.
- Recorded `SCDS-NATIVE-FIXTURES-2026-06-15` as native fixture/parser-edge
  proof only.
- Ran an inline Node/TypeScript parser inventory over the current wrapper scan
  roots with `node_modules`, `dist`, and `mod` excluded, then recorded the
  durable counts in row-owned records as `SCDS-IMPORT-INVENTORY-2026-06-15`.
  Temporary stdout artifacts from that inventory were scratch inputs only and
  are not durable proof.
- Updated the aggregate proof matrix, command proof log, corpus ledger, source
  synthesis, evidence log, downstream ledger, and task state for this
  checkpoint.

Current durable parser inventory summary:

- Scan roots: `packages`, `apps/mapgen-studio/src`,
  `mods/mod-swooper-maps/src/recipes`, `mods/mod-swooper-maps/src/maps`,
  `mods/mod-swooper-maps/src/domain`.
- Exclusions: `node_modules`, `dist`, `mod`.
- Counts: 1,943 scanned TS/TSX files, 230 `@mapgen/domain` references, 53
  current-predicate matching step contract files, 53 intended
  `contract.ts`/`*.contract.ts` files, 0 filename lookalikes, 0 `.tsx`
  step-contract files, 15 stage artifact contract files outside the predicate,
  0 recipe-local test contract files, 38 current-predicate domain references,
  0 current-row matches, 38 exact domain-root references, 0 exact forbidden
  references, 0 source lookalikes, 146 out-of-scope domain-subpath references,
  and 0 other-mod raw matching files.

Blocked/non-claim proof classes:

- Habitat wrapper selector/current-tree proof waits because the accepted
  command-trust/selector layer is not available in this row's stack/base.
- Raw Grit acquisition or accepted adapter proof remains unclaimed for closure.
- Injected proof remains blocked on the typed Grit adapter/injected cleanup
  substrate.
- Baseline proof remains blocked on the scaffold/baseline contract repair
  surface.
- Exact filename/source-scope closure remains open because source-prefix,
  source-relative, source-protocol, and `notacontract.ts` cases are current
  predicate facts, not predicate repair.
- Other-mod and recipe-local test fixture positives are native/current
  predicate facts only; they are not all-mod wrapper enforcement proof or
  product proof.
