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
- External adversarial review pending.
- Implementation pending adapter-substrate readiness and row-level proof.
