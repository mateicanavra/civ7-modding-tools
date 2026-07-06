# Domain Source Topology Ratchet Closure

Status: complete closure record

Scope:
execute `domain-root-topology-delete-absorbed-root-shape-rules-001` and close
the completed Domain Source Topology Enforcement Ratchet. This receipt records
the deletion slice that follows the post-ratchet rule revalidation pass. It does
not authorize adjacent rule cleanup, runner changes, baseline growth, source
movement, or package-test cleanup.

## Deleted Rule Packets

| Rule | Former owner lane | Survivor authority | Closure decision |
| --- | --- | --- | --- |
| `prohibit_retired_domain_root_catalogs` | `.habitat/blueprints/domain/` | `require_domain_source_topology` | Deleted; direct root `tags.ts` and `artifacts.ts` are fully covered by the positive domain-source topology law. |
| `require_domain_ops_root_presence` | `.habitat/blueprints/domain-operation/` | `require_domain_source_topology` | Deleted; hardcoded six-domain ops-root presence is fully covered by the generic domain-source topology law. |

## Absorber Proof Inherited

The deletion is backed by the reviewed post-ratchet revalidation receipt:

```text
.habitat/.active/workstreams/remediate-rule-authority/receipts/domain-root-topology-post-ratchet-revalidation-execution.md
```

Accepted proof:

- injected direct root `tags.ts` failed `require_domain_source_topology` with
  `unexpected-child`;
- injected direct root `artifacts.ts` failed `require_domain_source_topology`
  with `unexpected-child`;
- injected missing `ecology/ops` failed `require_domain_source_topology` with
  `missing-required-child`;
- the old duplicate rules failed the same old shapes before deletion;
- current source has no live direct domain-root catalog files and no missing
  domain ops roots.

## Ledger Closure

The operational ledger now treats this slice as complete:

```text
.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

Live row effect:

- `rules[]` no longer contains `prohibit_retired_domain_root_catalogs`;
- `rules[]` no longer contains `require_domain_ops_root_presence`;
- both ids are retained under `retiredRules[]` as historical closure records;
- live rule manifest and live ledger row counts are expected to match at `112`.

## Ratchet Closure

The Domain Source Topology Enforcement Ratchet is now concluded:

```text
blueprint enforcement
  -> question resolution for nondeterministic destinations
  -> deterministic burn-down
  -> repair drift
  -> Habitat ratchet
  -> post-ratchet rule revalidation
  -> absorbed duplicate-rule deletion
  -> closure and ascent
```

Residual adjacent rows are not unfinished work in this ratchet. They are future
descents or separate remediation frames because no completed positive authority
yet fully owns their intent:

- `prohibit_domain_artifacts_modules`;
- `require_ecology_canonical_op_module_topology`;
- `prohibit_foundation_op_contract_config_bags`;
- `prohibit_foundation_step_contract_config_bags`;
- Foundation recipe-stage cast/sentinel rows.

## Verification

Final proof results in the closing branch:

| Command | Result | Claim |
| --- | --- | --- |
| `bun habitat check --json --rule require_domain_source_topology` | pass | Survivor topology authority remains green. |
| `bun habitat classify .habitat` | pass | Authority-tree edits route to the expected Habitat owner. |
| live manifest/ledger parity script | pass: `112` live manifests, `112` live ledger rows, `0` missing, `0` stale | Deleted rule ids are no longer live rows. |
| retired-row script | pass: deleted ids absent from `rules[]` and present in `retiredRules[]` | Deletions are retained as historical closure records. |
| `bun run lint` | pass | Workspace lint remains green. |
| `bun run check -- --outputStyle=static --skipNxCache --nxBail=false` | pass | Root Nx check graph remains green. |
| `git diff --check` | pass | Diff has no whitespace errors. |

Non-claim:
aggregate `bun habitat check --json` was attempted, produced no JSON output
after several minutes, and was interrupted. This receipt does not claim an
aggregate Habitat pass; it claims the focused survivor authority proof, live
manifest/ledger parity, classification, lint, root check, and diff hygiene.
