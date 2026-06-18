# Phase Record: D13 Scaffolding And Refusal Contracts

## State

- Status: accepted for design/specification only after final D13 rereview.
- Worktree: `$WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D13_SOURCE_PACKET`.
- OpenSpec change: `$D13_CHANGE`.
- Design/specification acceptance: accepted; final rereview lanes recorded no
  unresolved P1/P2 findings against the post-fix disk state.
- Implementation completion: not started and not authorized.

## Objective

Specify the D13 Scaffolding and Refusal contract so later implementation cannot
invent request classes, owner boundaries, public compatibility handling,
validation oracles, or recovery language while coding.

## Current Gate

D13 has incorporated first-wave negative findings from:

- `$D13_DOMAIN_REVIEW`
- `$D13_TYPESCRIPT_REVIEW`
- `$D13_TOPOLOGY_REVIEW`
- `$D13_INFORMATION_REVIEW`
- `$D13_CROSS_DOMINO_REVIEW`

The packet is accepted for design/specification only. Final rereview lanes read
the post-fix repaired disk state and covered domain/ontology, TypeScript and
validation, code/vendor topology, OpenSpec/information, and cross-domino/product
compatibility:

- `$D13_FINAL_DOMAIN_REVIEW`
- `$D13_FINAL_TYPESCRIPT_VALIDATION_REVIEW`
- `$D13_FINAL_OPENSPEC_INFORMATION_REVIEW`
- `$D13_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW`
- `$D13_FINAL_CROSS_DOMINO_PRODUCT_REVIEW`

## Design-Time Validation Gates

| Gate | Expected state | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict` | passed after packet repair | OpenSpec shape only. |
| `bun run openspec:validate` | passed after packet repair | Corpus shape only. |
| `git diff --check` | passed | Whitespace only. |
| Complete-standard wording audit over `$D13_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, `$REMEDIATION_DIR/context.md`, and `$AGENT_SCRATCH/domino-D13-*.md` | passed with no forbidden-term hits | Language/control sanity only. |
| Final rereview lanes | no unresolved P1/P2 findings | Design/specification acceptance only. |

## Later Implementation Gates

| Gate | Expected state | Non-claim |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` | passes with D13 scenario coverage | Unit tests do not prove live Nx CLI alone. |
| Supported project dry-run | exit 0, supported paths only, no writes | Does not prove product/runtime behavior. |
| Unsupported project dry-run | nonzero structured no-write refusal | Does not implement unsupported kind. |
| Candidate pattern dry-run | exit 0, candidate-only paths | Does not register a rule. |
| Registered promotion missing/rejected manifest | nonzero D8-owned no-write refusal | Does not admit Pattern Governance. |
| Host/Authoring bad cases | source-blocked until G-HOST/D14 inputs exist | Does not infer host or authoring semantics. |

## Source Blockers

Later source implementation remains blocked behind:

- concrete D0 rows for touched generator/schema/help/output/docs/export surfaces;
- live D2 `ruleGovernanceFacts` and `ruleGeneratedZoneFacts` where consumed;
- live D8 candidate/admission/refusal projections where pattern promotion is
  touched;
- accepted/live G-HOST declarations before host-owned scaffold behavior is
  implemented;
- D14 early-fence language before authoring-specific refusal wording is
  implemented.

## Non-Claims

- This remediation packet does not implement Habitat source changes.
- This packet does not make D13 implementation-complete.
- This packet does not make candidate pattern output active Pattern Governance.
- This packet does not implement host policy or Authoring Topology.
- Current code names remain compatibility facts unless design.md accepts them as
  D13 target language.
