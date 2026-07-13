# G.2.1 Rule Fix Preview Authority

```json
{"unit":"G2.1-RULE-FIX-PREVIEW","base":"93b1153ca2173a708af958b756583fc9c874d2aa","state":"sealed-local-graphite-layer","objective":"preview admitted source transformations as closed vendor-neutral file impacts without granting write authority","implementationOwner":"closed","reviewRoles":["typescript-state-space","architecture-authority","product-runtime-library"],"remoteMutation":false}
```

## Decision

The user proposal is accepted with one evidence-driven correction. A changed-path
Grit `Rewrite` can also change contents while exposing no contents in compact
output. It therefore projects both `rename` and destination `modify`; the rule
must declare both effects. Calling that event rename-only would grant undeclared
content authority.

The sealed G.2 path is otherwise too lossy: it calls a diagnostic capability,
erases compact event meaning, and reports only affected paths under the false
name `RuleFixPlanning`. Replace it categorically with `RuleFixPreview` and the
closed impacts `modify | create | rename | delete`. Keep rule selection atomic,
multi-rule execution ordered, typed not-applicability, and categorical refusal
of live writes.

Registered `runner.fix` authority becomes
`{ kind: "preview-only", pattern, effects }`. Effects are required, nonempty,
unique, and closed. Every fix-admitted rule must use exact path coverage. The
provider validates canonical absolute evidence against the repository, the
complete planned root tuple, and exact coverage, then exposes deterministic
repository-relative POSIX paths. Undeclared effects are a distinct per-rule
authority refusal.

One pinned-native invocation over the complete root tuple is required. A live
two-root fixture produced a cross-root rewrite only when both roots were passed
to one command; the old per-root loop returned clean twice. Delete that
aggregation state. Compact `RemoveFile` cardinality is
`max(1, original.ranges.length)`, backed by the pinned source and closed wire
fixture; the pinned CLI currently has no live constructor, so no live-emission
claim is made. Absolute CreateFile evidence is live-proven; relative evidence
remains incomplete rather than acquiring an invented base.

## State And Path Laws

- Success is `previewed` with deterministic `impacts`; a clean observation has
  an empty impact list.
- `found > 0` with no transformation event is provider-incomplete for preview,
  while Match remains valid diagnostic evidence.
- Same-path Rewrite is `modify`; changed-path Rewrite is `rename` plus
  destination `modify`; CreateFile is `create`; RemoveFile is `delete`.
- Exact duplicate provider findings collapse. Distinct transformation findings
  sharing an endpoint fail incomplete before projection; the rename/modify pair
  from one changed-path Rewrite is one atomic provider observation.
- Existing sources for modify/rename/delete must canonicalize. Create and rename
  destinations require a canonical existing parent plus an absent non-symlink
  leaf. Every endpoint must remain inside one selected root, the repository,
  and exact rule coverage.
- Impact count is never Grit match cardinality. The capability never writes.

## Non-Goals

No live application, rollback, transaction, patch, desired contents, hashes,
generic filesystem mutation, provider selector, generation redesign, universal
change plan, compiler-API verifier, or new tracking machinery. Biome retains
source-hygiene authority, Nx Tree/templates known-shape generation, Habitat
Structure filesystem topology, Grit source-aware transformations, and Habitat
registration, admission, scope, and stable projection.

## Exact Write Set

The design-time list is historical: it included two expected paths that
remained unchanged and predated the earned `apply-findings.ts` module plus
the current ownership amendment. The complete final candidate is these 54
paths:

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
docs/projects/habitat-harness/deep-refactor/service-shape-backlog.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/NEXT-PACKET.md
docs/projects/mapgen-studio-runtime-transition/TAKEOVER-FRAME.md
docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/packet-a2-domain-operation-topology.md
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-rule-fix-preview-01.md
docs/system/ADR.md
tools/habitat/README.md
tools/habitat/docs/CAPABILITIES.md
tools/habitat/docs/DOMAIN-MAPPING.md
tools/habitat/docs/GAPS.md
tools/habitat/docs/IMPLEMENTED-SURFACE.md
tools/habitat/docs/SCENARIOS.md
tools/habitat/src/cli/commands/fix.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-findings.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-planning.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-preview.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/runner.ts
tools/habitat/src/resources/rule-fix-planning/index.ts
tools/habitat/src/resources/rule-fix-planning/resource.ts
tools/habitat/src/resources/rule-fix-preview/index.ts
tools/habitat/src/resources/rule-fix-preview/resource.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/contract.ts
tools/habitat/src/service/modules/fix/module.ts
tools/habitat/src/service/modules/fix/router.ts
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/rule-fix-planning.test.ts
tools/habitat/test/lib/rule-fix-preview.test.ts
tools/habitat/test/rules/registry/contract.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/rules/registry/manifest-contract.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```

Old planning paths are deletion entries; preview paths replace them. Generated
execution-surface outputs may remain byte-identical, but no generator may write
outside this list. Any newly discovered path requires root reclassification
before editing.

## Proof Oracle

- TypeBox rejects missing, empty, duplicate, and unknown effects; registry load
  rejects fix admission outside exact coverage; facts preserve the one authority.
- Closed wire tests cover all compact variants and cardinality. Live pinned
  native covers modify, changed-path rewrite, absolute create, match-only, and
  cross-root multifile execution, with before/after tree digests.
- Path tests cover both rename endpoints, create collision/symlink/missing
  parent, escape, root, exact coverage, deterministic dedupe, and conflicting
  endpoints.
- Product tests preserve atomic multi-rule selection, typed not-applicability,
  provider and scope failures, undeclared-effect refusal, and readable impacts.
- Focused tests, Habitat check/test/build/boundaries, strict OpenSpec, scoped and
  differential Biome, registered provider-import authority, execution-surface
  generation, import/old-name census, and live no-write CLI proof pass.
- The frozen candidate receives three fresh sessions in the permanent review
  roles. Repairs reopen every materially affected role. Git and Graphite remain
  root-only under a bounded mutation lease.

## Root Proof

```json
{"state":"passed","focusedTests":{"passed":119,"skipped":2},"fullTests":{"passed":402,"skipped":2},"biome":{"baseErrors":29,"candidateErrors":28,"newProviderResourceFiles":"passed"},"openspec":{"passed":370,"failed":0},"mutation":"none"}
```

- Uncached Habitat `check`, `test`, `build`, and `boundaries` passed; the full
  Habitat suite ran 402 tests with two platform skips.
- Direct `habitat check`, the registered provider-import rule, strict OpenSpec,
  JSON/JSONL parsing, execution-surface regeneration, and diff hygiene passed.
- Default and selected `habitat fix --dry-run` returned no impacts; a complete
  candidate digest was byte-identical before and after both commands. Invalid
  selection and non-dry live mutation refused with exit code 1.
- Live pinned-native tests cover check truth, rewrite cardinality, absolute
  create evidence, changed-path rename plus modify, Match-only refusal, and
  cross-root multifile execution without source mutation. Closed wire fixtures
  cover zero- and multi-range `RemoveFile` cardinality.

## Exact Review

```json
{"semanticFreeze":"f802f7a3b1482199190fbf0d045a941e4645266ea60711ed097ad1b58fb2f9ae","successorFreeze":"afbe13337a2d69eddff7da0f7c80f6d0e1d81769eefc0e819e16c0b306db22d4","paths":54,"result":"passed-after-one-p2-repair"}
```

Fresh sessions filled all three permanent roles. TypeScript/state-space and
product/runtime/library passed the first semantic freeze. Architecture accepted
one P2 because current Habitat references still described planning,
transactions, and apply authority that the capability deletes.

One bounded owner corrected four current references and added provider-route
proof for deterministic duplicate collapse and conflicting transformation
endpoints. Focused proof passed 45 tests with two host skips; Habitat typecheck
and diff/JSON hygiene passed. Three entirely fresh affected reviewers
reproduced the 54-path successor, proved that only those five blobs changed,
and returned zero P0-P3 findings.

Residuals remain explicit and non-blocking: `RemoveFile` projection is backed by
closed compact-wire evidence rather than a live pinned-native constructor; two
binary identity checks are host-specific; collision and symlink cases combine
real filesystem validation with closed provider events. No claim exceeds that
evidence.

## Seal Receipt

```json
{"branch":"codex/mapgen-runtime-closeout-rule-fix-preview","parent":"93b1153ca2173a708af958b756583fc9c874d2aa","initialCreate":"db29d01013d4323f892064d2960ba07e6dff3595","paths":54,"remoteMutation":false,"state":"sealed"}
```

The staged paths and bytes exactly matched record-closeout digest
`858f3f209a6f3a39f3ef528e911d938c05d36122e05938894b076f6c08529503`.
Graphite created one child above A.3a. This receipt and the live control records
are the only post-create mutations; the amended branch ref owns final identity
because a commit cannot contain its own hash. No submit, push, sync, restack,
merge, PR, readiness, stale-worktree, or A.2 mutation ran.
