## 1. Authority And Corpus

- [x] 1.1 Read root and Swooper subtree agent guidance before source edits.
- [x] 1.2 Read GritQL documentation/examples for rewrite and `contains bubble`
  syntax before changing the apply pattern.
- [x] 1.3 Identify the three live RHR helper candidates from the accepted
  runtime-helper inventory.

## 2. Implementation

- [x] 2.1 Add a row-owned `helper_redeclarations_to_imports` apply pattern.
- [x] 2.2 Prove exact plain `clamp01` helper replacement to canonical
  `clamp01` import.
- [x] 2.3 Prove non-finite `clamp01` helper replacement to canonical `clampPct`
  import plus explicit `clampPct(value, 0, 1, 0)` call-site rewrites.
- [x] 2.4 Remediate the three live Swooper source files without editing
  generated output.
- [x] 2.5 Keep `habitat fix` apply registration unchanged; multi-apply adapter
  registration is out of scope.

## 3. Proof

- [x] 3.1 Run native Grit fixture proof for
  `helper_redeclarations_to_imports`.
- [x] 3.2 Run direct exact-file dry-run and live apply/discovery proof for the
  original three helper candidates.
- [x] 3.3 Record P1 semantic repair: no `clampPct as clamp01` alias remains and
  non-finite replacements use explicit `clampPct(value, 0, 1, 0)`.
- [x] 3.4 Run representative finite/`NaN`/`Infinity`/`-Infinity` equivalence
  proof.
- [x] 3.5 Run parser inventory confirming zero remaining RHR current-predicate
  candidates.
- [x] 3.6 Run Swooper package-local validation after building
  `@swooper/mapgen-core`.
- [x] 3.7 Run Habitat wrapper proof for `grit-runtime-helper-redeclarations`.
- [x] 3.8 Run OpenSpec validations and hygiene checks.

## 4. Records And Checkpoint

- [x] 4.1 Update row packet and aggregate Grit records with exact proof classes.
- [x] 4.2 Preserve non-claims: no Habitat apply registration, generic
  transaction, injected apply proof, generated-output edit, or product/runtime
  proof.
- [x] 4.3 Commit locally through Graphite with a clean worktree.
