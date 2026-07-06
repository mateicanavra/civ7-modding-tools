# Rule Remediation: G4 Recipe Domain Import Matrix Slice

Status: closed

Branch: `codex/habitat-g4-domain-import-matrix`

Canonical source: `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Purpose

Close the G4 public-domain import matrix boundary-inversion slice for standard
recipe source. The slice replaces overlapping negative proxy rows with one
positive Grit rule and repairs the current recipe import that reached through a
deep domain internal path.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `require_public_domain_surfaces_in_recipes_and_maps` | Preserved as the single positive G4 recipe import matrix rule. |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | Absorbed into the surviving Grit rule and deleted as a separate live packet. |
| `restrict_recipes_to_public_domain_surfaces` | Absorbed into the surviving Grit rule and deleted as a separate live packet. |

## Exclusions

Map-source clauses from the old packets are excluded from this slice. The
accepted architecture packet names the first G4 enforcement as
`src/recipes/**`; broader map-source authority remains policy until a
map-specific owner and public-surface decision exists.

Nx project boundaries are also excluded. Nx enforces project-plane tag
constraints; this is an intra-project recipe import-surface rule under
`mods/mod-swooper-maps`, so Habitat/Grit owns the current check.

## Decision

Use one Grit rule, not a bespoke script and not package-owned tests. The
predicate is static import/export source-shape enforcement:

- allow `@mapgen/domain/<domain>`;
- allow `@mapgen/domain/<domain>/ops`;
- allow `@mapgen/domain/<domain>/ops/index.js`;
- allow `@mapgen/domain/<domain>/config.js`;
- forbid deeper alias tails from recipe source;
- forbid the known recipe relative reaches into `src/domain`.

A script would only be justified if the rule needed path resolution beyond the
known recipe depths, build/currentness proof, or data-driven structural
validation. This slice does not.

## Source Repair

`mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts`
was importing `DEFAULT_ELEVATION_SCALE` from a deep morphology op internal.
The source now imports that constant from the public morphology ops surface,
and `mods/mod-swooper-maps/src/domain/morphology/ops/index.ts` exports it.

## Review Disposition

| Finding | Disposition |
| --- | --- |
| G4 is source-backed for recipes only; maps are not authorized by the first-enforcement packet. | Accepted. The survivor rule is recipe-only and map clauses are explicitly excluded. |
| The current source has one recipe deep import violation. | Accepted. The import was repaired through the public morphology ops surface. |
| Consolidate overlapping proxies into one allowed-surface rule. | Accepted. One surviving Grit packet now owns the G4 recipe matrix. |
| Convert to a Habitat script for exact path resolution. | Rejected for this slice. Grit is sufficient for the syntax-level predicate and is the native Habitat rail here. |

## Verification

- `bun habitat check --rule require_public_domain_surfaces_in_recipes_and_maps --json`
  passed with the Grit runner.
- Auxiliary recipe import scan found no current source matching the forbidden
  G4 domain-surface shapes.
- `bun run --cwd tools/habitat test test/lib/pattern-apply.test.ts
  test/rules/pattern-views.test.ts test/service/fix-service.test.ts
  test/rules/registry/contract.test.ts` passed.
- `nx run mod-swooper-maps:check` passed after the actual
  `@mapgen/domain/morphology/ops` entrypoint exported
  `DEFAULT_ELEVATION_SCALE`.
- Live manifest/support/runner path resolution and canonical JSON coverage
  reconcile at 118.
- `bun habitat classify .habitat` passed.
- `bun run --cwd tools/habitat check` passed.
- `git diff --check` passed.
- Old absorbed manifests are removed from the live authority tree.
- Canonical JSON now reconciles 118 current live rows with 9 retired
  historical rows.
- No package-owned tests or bespoke Habitat script were introduced.
