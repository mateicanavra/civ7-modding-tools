## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm the current candidate obligation from the Grit corpus ledger.
- [x] 1.3 Confirm Biome `useImportType` authority and safe-fix ownership.
- [x] 1.4 Confirm no existing repo Biome configuration change is made in this
  HG row.

## 2. Inventory And Owner Disposition

- [x] 2.1 Run `biome explain useImportType` and record the rule class, safe-fix
  status, and caveats.
- [x] 2.2 Run the focused Biome inventory for `style/useImportType`.
- [x] 2.3 Run a deterministic TypeScript parser inventory over `packages`,
  `mods`, `apps`, and `tools`.
- [x] 2.4 Reject broad Grit apply ownership for value-to-type conversion unless
  a future narrow row includes TypeScript semantic usage proof.

## 3. Record Alignment

- [x] 3.1 Update the corpus ledger candidate row with the owner disposition.
- [x] 3.2 Update the aggregate proof matrix with the disposition proof ids.
- [x] 3.3 Update the aggregate command proof log with the Biome and parser
  evidence.
- [x] 3.4 Do not add a Grit pattern, rule registration, baseline, injected
  probe, or source rewrite.

## 4. Validation

- [x] 4.1 `bun run openspec -- validate habitat-grit-apply-type-only-imports --strict`
- [x] 4.2 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 4.3 `bun run openspec:validate`
- [x] 4.4 `git diff --check`
- [x] 4.5 `git ls-files --deleted`
- [x] 4.6 Commit via Graphite with clean worktree.

## 5. Non-Claims

- [x] 5.1 No active Grit pattern, native Grit fixture, Grit baseline, or
  injected probe is claimed.
- [x] 5.2 No Habitat apply registration, source remediation, or apply safety is
  claimed.
- [x] 5.3 No Biome policy/configuration change or broad type-only import
  closure is claimed.
- [x] 5.4 No product/runtime proof is claimed.
