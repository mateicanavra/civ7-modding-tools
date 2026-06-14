# Source Synthesis - Domain Deep Import Proof

## Authority Order

1. `docs/projects/habitat-harness/dra-takeover-frame.md`
2. `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
3. `tools/habitat-harness/src/rules/rules.json`
4. `docs/system/libs/mapgen/policies/IMPORTS.md`
5. `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
6. Current pattern file and command behavior
7. Official Grit docs
8. H5/H6 historical records

## Product Source

The takeover frame requires each Grit pattern workstream to start from a
corpus row, state owner/proof shape, and keep proof classes separate. The Grit
ledger row for `grit-domain-deep-import` says recipes/maps compose domains
through public surfaces, not deep internals, and assigns OpenSpec id
`habitat-grit-proof-domain-deep-import`.

## Architecture Source

`rules.json` registers the rule as enforced, owner `grit-check`, owner project
`mod-swooper-maps`, scope `mods/*/src/{recipes,maps}/**/*.ts`, and message
"Import domain code through @mapgen/domain/<domain>, /ops, or /config.js rather
than deep internals."

`IMPORTS.md` says recipe assembly should use public domain surfaces and expose
needed symbols through domain root, `/ops`, or `/config.js`.

`NORMALIZATION-GUARDRAILS.md` G4 names Habitat
`grit-recipe-domain-surface` and `grit-domain-deep-import` as mechanical checks
for recipes consuming sanctioned domain public surfaces rather than op
internals.

## Current Pattern Source

`.grit/patterns/habitat/checks/domain_deep_import.md`:

- frontmatter `level: error`;
- explicit `language js(typescript)`;
- file predicate for `mods/<mod>/src/recipes` and `mods/<mod>/src/maps`;
- source predicate for `ops/<tail>`, `ops-by-id`, `rules/<tail>`, and
  `strategies/<tail>`;
- import, named re-export, and star re-export arms.

Current native samples:

- one positive default import from `@mapgen/domain/foundation/ops/private`;
- one negative public `/ops` import.

Current defect evidence:

- `ops-by-id` is claimed by rule metadata and this row's intended source
  family, but a disposable Grit probe reports `ops/private` while not reporting
  `ops-by-id` import or re-export.
- Recipe/map-local test paths under `__tests__` and `__type_tests__` currently
  report this rule because they satisfy the filename predicate.
- Relative local-domain reaches such as
  `../../../../../../domain/resources/lib/corpus/types.js` are outside this
  alias-based pattern and need a sibling guard or accepted non-claim.

## Official Grit Source

Official Grit docs establish:

- `grit patterns test --filter` as the pattern fixture proof command;
- Markdown pattern conventions under `.grit/patterns`;
- frontmatter `level` for diagnostics;
- `grit check [PATHS]...` as current-tree check command;
- explicit `language js(typescript)` as the TypeScript parser declaration.

Official docs do not establish Habitat rule projection, shrink-only baselines,
injected-probe cleanup, or stale-record truth. Habitat owns those proof
classes.

## Local Evidence

| Evidence id | Source | Result | Implication |
| --- | --- | --- | --- |
| DDI-E1 | `grit patterns test --filter domain_deep_import --json` | exits 0; one testable pattern succeeds | native fixture proof exists |
| DDI-E2 | `bun run habitat:check -- --json --rule grit-domain-deep-import` | exits 0; `grit-domain-deep-import` and `baseline-integrity` pass | valid wrapper selection currently passes |
| DDI-E3 | `rg` exact forbidden source family over recipes/maps | no output | no obvious live forbidden imports |
| DDI-E4 | bounded raw `grit check` over recipe/map roots | exits 0 with `results: []` | raw current-tree zero-result seed for the bounded roots |
| DDI-E5 | `rg "@mapgen/domain/"` over recipes/maps | many public domain root, `/ops`, and `/config.js` imports | negatives are live and should remain allowed |
| DDI-E6 | `git status --short --branch` after probes | clean branch header | evidence probes did not leave changes |
| DDI-E7 | disposable `ops-by-id` Grit probe | `ops/private` reports; `ops-by-id` import/re-export do not | claimed family needs predicate repair |
| DDI-E8 | disposable recipe/map-local test-path probes | test paths report for `ops/private` | test-scope decision is required |
| DDI-E9 | relative local-domain import inventory | six current recipe imports reach local `src/domain/**` | alias-only non-claim is required |

## Design Consequences

1. The row is ready for a per-pattern packet.
2. Native fixture proof needs expansion before implementation closure.
3. Current zero-result proof is useful but does not replace injected proof.
4. Public `/ops`, `/config.js`, and domain-root imports must remain negative
   cases.
5. Apply remediation stays in the separate apply packet.
6. `ops-by-id` must be repaired and proven before this row can leave pending
   status.
7. Recipe/map-local test paths must be explicitly included or excluded.
8. Relative local-domain reaches must be linked to a sibling guard or accepted
   non-claim.
9. Probe implementation waits for the accepted Grit adapter substrate.
