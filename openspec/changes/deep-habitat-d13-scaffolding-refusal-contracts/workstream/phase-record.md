# Phase Record: D13 Scaffolding And Refusal Contracts

## State

- Status: source implementation in validation.
- Worktree: `$WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D13_SOURCE_PACKET`.
- OpenSpec change: `$D13_CHANGE`.
- Design/specification acceptance: accepted; final rereview lanes recorded no
  unresolved P1/P2 findings against the post-fix disk state.
- Implementation completion: D13 source behavior implemented; final validation
  and Graphite closure in progress.

## Objective

Implement the D13 Scaffolding and Refusal contract so generator writes are
bounded to supported plugin scaffolds and candidate pattern drafts, while
unsupported project kinds and active pattern registration requests refuse before
writes.

## Current Gate

D13 has incorporated first-wave negative findings from:

- `$D13_DOMAIN_REVIEW`
- `$D13_TYPESCRIPT_REVIEW`
- `$D13_TOPOLOGY_REVIEW`
- `$D13_INFORMATION_REVIEW`
- `$D13_CROSS_DOMINO_REVIEW`

The packet moved from accepted design/specification into source implementation.
Final rereview lanes covered domain/ontology, TypeScript and validation,
code/vendor topology, OpenSpec/information, and cross-domino/product
compatibility:

- `$D13_FINAL_DOMAIN_REVIEW`
- `$D13_FINAL_TYPESCRIPT_VALIDATION_REVIEW`
- `$D13_FINAL_OPENSPEC_INFORMATION_REVIEW`
- `$D13_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW`
- `$D13_FINAL_CROSS_DOMINO_PRODUCT_REVIEW`

## Design-Time Validation Gates

| Gate | Expected state | Scope limit |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict` | passed after packet repair | OpenSpec shape only. |
| `bun run openspec:validate` | passed after packet repair | Corpus shape only. |
| `git diff --check` | passed | Whitespace only. |
| Wording audit over D13 source and records | in progress for implementation closure | Language/control sanity only. |
| Final rereview lanes | no unresolved P1/P2 findings | Reviewer findings still require source validation. |

## Later Implementation Gates

| Gate | Expected state | Scope limit |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | passed: 41 tests after removing real-worktree Nx discovery from the unit suite | Unit tests cover generator contracts on in-memory trees; live Nx CLI behavior is checked by separate dry-run commands. |
| Supported project dry-run | passed: exit 0, supported plugin paths only, no writes | Does not create app, foundation, mod, or host topology scaffolds. |
| Unsupported project dry-run | passed: nonzero structured no-write refusal for `--kind=mod` | Does not implement unsupported kind. |
| Candidate pattern dry-run | passed: exit 0, candidate-only paths | Does not register a rule. |
| Active registration missing/rejected manifest | passed: advisory and enforced lifecycles refuse with Pattern Governance message | Candidate generator remains non-registering. |
| Host/Authoring bad cases | outside D13 source scope until G-HOST/D14 define generator-safe inputs | Does not infer host or authoring semantics. |

## Source Boundary

D13 source implementation is limited to plugin project scaffolding, candidate
pattern drafts, and no-write refusals for unsupported project kinds and active
pattern registration requests. Host policy and Authoring Topology scaffolding
remain outside D13 source scope until their owners define generator-safe inputs.
