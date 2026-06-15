# Phase Record - Recipe Domain Surface Proof

## Selection

Selected workstream: `habitat-grit-proof-recipe-domain-surface`.

Reason: this is the first current check row in the Grit corpus ledger without a
row-specific OpenSpec packet after the already-opened domain deep import and
contract export rows. It also guards retired recipe import lint/test invariants,
so stale closure records are likely unless the row gets its own proof contract.

## Systematic Gates

### Gate 1 - Frame

Objective, hard core, exterior, falsifier, owner boundary, stop conditions, and
proof gates are recorded in `proposal.md` and `design.md`.

### Gate 2 - Repo State

Initial state:

- branch: `codex/habitat-dra-takeover-frame`;
- latest commit: `a4d80a087 docs(habitat): design contract export proof`;
- Graphite status: clean before this packet opened;
- worktree status: clean before this packet opened;
- active mode: design/specification, not implementation.

### Gate 3 - Diagnosis

Current evidence proves catalog presence and current pass state, but not
row-level closure:

- native fixture passes;
- wrapper rule selection passes;
- bounded raw check over the recipe root reports no results;
- current native fixture does not prove parser-edge forms or exact root/ops/config
  negatives;
- current predicate allows any source containing `/ops` or `/config.js` through
  substring exclusions, including tail cases and lookalike segments;
- `ops-by-id` is outside this row and currently defective in the neighboring
  domain-deep-import row;
- namespace imports, side-effect imports, and recipe-local tests need
  classification before downstream records can claim all recipe imports;
- injected violation and baseline proof remain absent.

### Gate 4 - Corpus

Corpus row source:

- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` row
  `grit-recipe-domain-surface`;
- aggregate matrix row in
  `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`.

### Gate 5 - Grouping

This row belongs to the domain-surface family. It remains recipe `.ts`
public-surface proof until exact-surface gaps and neighboring-rule overlap are
accepted.

### Gate 6 - Expectations

Expected current state before implementation:

- no live in-scope recipe `.ts` violations;
- live recipe `/ops` and `/config.js` imports remain allowed;
- `/ops/<tail>` should be linked to `grit-domain-deep-import`;
- `ops-by-id` remains blocked until a neighboring repair or accepted owner
  proves it;
- `config.js/<tail>` requires repair, sibling ownership, or blocked downstream
  disposition;
- contains-substring lookalikes such as `/ops-private`, `/private/ops`,
  `/config.js-private`, and `/private/config.js` require repair, sibling
  ownership, or blocked downstream disposition;
- namespace imports, side-effect imports, and recipe-local test paths require
  fixture or adapter proof before closure;
- injected positives should fail the exact Habitat rule id.

### Gate 7 - Architecture Translation

Owner: Grit check. Forbidden owners: import rewrite safety, generator repair,
runtime proof, map-source policy except via boundary records, and step-contract
policy except via boundary records.

### Gate 8 - Slice

This OpenSpec packet is the slice. It defines write set, protected paths,
review lanes, tasks, and downstream realignment.

## Effect/Substrate Note

Injected proof implementation waits for `habitat-effect-grit-adapter` or an
accepted typed Grit adapter substrate because the probe harness needs scoped
file creation, command provenance, exact rule projection, overlap
classification, parser-edge classification, and cleanup proof.

The substrate decision is not decorative. If implementation chooses not to use
Effect for this row, the substitute must still provide typed failures,
service-injected tests, scan-root provenance, parser classifications, overlap
classification, and cleanup behavior.

## Current Status

- Packet opened.
- Local evidence recorded.
- External review completed with no P1 findings and three accepted P2 repairs.
- Implementation pending adapter-substrate readiness and row-level proof.

## Implementation DRA Update - 2026-06-15

Branch/worktree:

- branch: `agent-HG-habitat-grit-recipe-domain-surface`;
- parent layer: `agent-HG-habitat-grit-pattern-chain`;
- worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`;
- row: `grit-recipe-domain-surface` / `recipe_domain_surface`.

Completed independent row-owned work:

- expanded the native `Matches fixture` to cover ten current-predicate classes:
  default import, named import, namespace import, type import, side-effect
  import, named re-export, type re-export, star re-export, recipe-local test
  path, and step-contract overlap path;
- expanded the native `Ignores fixture` for domain root, exact `/ops`, exact
  `/config.js`, `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`,
  contains-substring lookalikes, `.tsx`, maps, other mods, and non-recipe
  controls;
- recorded parser inventory over current wrapper roots: 230 `@mapgen/domain`
  references, 124 inside the recipe predicate, 0 current-row matches, 124
  exact allowed recipe references, 0 excluded-but-non-exact recipe references,
  0 recipe-local test references, and 38 step-contract references inside the
  recipe predicate.

Blocked/non-claim surfaces:

- Habitat wrapper selector proof waits because the accepted command-trust and
  selector-truth layer from `agent-HR-habitat-repair-chain` is not available
  in this row's stack/base;
- raw acquisition closure waits for accepted raw acquisition or typed adapter
  proof;
- explicit empty baseline proof and baseline expansion safety wait for the
  scaffold/baseline contract repair surface;
- injected current-tree probes and cleanup proof wait for an accepted typed
  Grit adapter substrate;
- exact-surface closure for `/ops/<tail>`, `ops-by-id`, `config.js/<tail>`,
  and contains-substring lookalikes waits for predicate repair, sibling proof
  ids, or downstream blocked records.
