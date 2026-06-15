## 1. Design And Review Gate

- [x] 1.1 Open this repair packet with proposal, design, spec delta, tasks,
  phase record, review disposition ledger, and downstream realignment ledger.
- [x] 1.2 Run command-surface, evidence, and system review lanes against the
  packet before implementation.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`.

## 2. Entrypoint Repair

- [ ] 2.1 Replace the manual `bin/dev.ts` command map with repo-standard oclif
  development command discovery while preserving source-command execution under
  Bun.
- [ ] 2.2 Verify `src/bin/habitat.ts` remains aligned with the canonical
  development runner or remove any source-only path that can diverge.
- [ ] 2.3 Build the harness package and prove `bin/run.js` root and subcommand
  help from generated production artifacts.

## 3. Selector Truth Repair

- [ ] 3.1 Replace unvalidated array filtering with an explicit selector result
  boundary for owner/rule/tool/all-rules states.
- [ ] 3.1a Ensure selector failures carry structured facts for selector kind,
  requested value, known status, matched namespace, matching rule ids, and
  empty-intersection participants.
- [ ] 3.2 Render invalid selector requests as failing schemaVersion 1
  CheckReports in JSON mode.
- [ ] 3.3 Render invalid selector requests as non-zero human command failures
  in non-JSON mode.
- [ ] 3.4 Apply the same selector validation to `--expand-baseline`, with no
  baseline writes when selection is invalid.
- [ ] 3.5 Preserve valid single-rule and valid tool selection behavior.

## 4. Tests And Probes

- [ ] 4.1 Add unit tests for valid selections, unknown owner, unknown rule,
  unknown tool, and valid selectors whose combined intersection has no rule.
- [ ] 4.2 Use a fake rule registry for selector tests so the selector boundary
  is proven without real baseline loading or rule execution.
- [ ] 4.3 Add JSON compatibility tests for invalid selector reports using
  `validateCheckReport`.
- [ ] 4.4 Add real root/dev entrypoint smoke tests for root help, check help,
  unknown command, and invalid selectors.
- [ ] 4.5 Add production runner smoke proof after build.
- [ ] 4.6 Add human-mode invalid selector smoke proof for unknown owner,
  unknown rule, unknown tool, and valid selectors with empty intersection.
- [ ] 4.7 Add invalid `--expand-baseline` proof for unknown owner, unknown
  rule, unknown tool, and valid selectors with empty intersection; each proof
  must show no baseline file is created or changed.
- [ ] 4.8 Add invalid selector `--json --output <path>` proof that writes the
  failing CheckReport to the requested output path.
- [ ] 4.9 Keep command-class tests, but ensure they are no longer the only
  command proof recorded.
- [ ] 4.10 Record command proof metadata for every verification command using
  the proof record shape in `design.md`.

## 5. Verification

- [ ] 5.1 `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`
- [ ] 5.2 `bun run --cwd tools/habitat-harness clean`
- [ ] 5.3 `bun run habitat -- --help`
- [ ] 5.4 `bun run habitat -- check --help`
- [ ] 5.5 `bun tools/habitat-harness/bin/dev.ts --help`
- [ ] 5.6 `bun tools/habitat-harness/bin/dev.ts check --help`
- [ ] 5.7 `bun run habitat -- definitely-not-a-command`
- [ ] 5.8 `bun tools/habitat-harness/bin/dev.ts definitely-not-a-command`
- [ ] 5.9 `nx run @internal/habitat-harness:build`
- [ ] 5.10 `bun tools/habitat-harness/bin/run.js --help`
- [ ] 5.11 `bun tools/habitat-harness/bin/run.js check --help`
- [ ] 5.12 `bun tools/habitat-harness/bin/run.js definitely-not-a-command`
- [ ] 5.13 `bun run habitat:check -- --rule definitely-not-a-rule`
- [ ] 5.14 `bun run habitat:check -- --tool definitely-not-a-tool`
- [ ] 5.15 `bun run habitat:check -- --owner definitely-not-a-project`
- [ ] 5.16 `bun run habitat:check -- --owner @civ7/control-orpc --tool biome`
- [ ] 5.17 `bun run habitat:check -- --json --rule definitely-not-a-rule`
- [ ] 5.18 `bun run habitat:check -- --json --tool definitely-not-a-tool`
- [ ] 5.19 `bun run habitat:check -- --json --owner definitely-not-a-project`
- [ ] 5.20 `bun run habitat:check -- --json --owner @civ7/control-orpc --tool biome`
- [ ] 5.21 `bun run habitat:check -- --json --output /tmp/habitat-invalid-selector.json --rule definitely-not-a-rule`
- [ ] 5.22 `bun run habitat:check -- --json --rule grit-check`
- [ ] 5.23 `bun run habitat:check -- --json --tool grit-check`
- [ ] 5.24 `bun run habitat:check -- --expand-baseline --rule definitely-not-a-rule`
- [ ] 5.25 `bun run habitat:check -- --expand-baseline --owner definitely-not-a-project`
- [ ] 5.26 `bun run habitat:check -- --expand-baseline --tool definitely-not-a-tool`
- [ ] 5.27 `bun run habitat:check -- --expand-baseline --owner @civ7/control-orpc --tool biome`
- [ ] 5.28 `bun run --cwd tools/habitat-harness test`
- [ ] 5.29 stale-record scan:
  `rg -n "closed|CLOSED|DONE|revalidated|root help|check help|help smoke|green|no code-violates-docs|agent-F-habitat-harness-workstream" docs/projects/habitat-harness openspec/changes/habitat-* -g '*.md'`
- [ ] 5.30 `bun run openspec:validate`

## 6. Downstream Realignment And Closure

- [ ] 6.1 Update `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`
  so stale help proof is historical and points to this repair.
- [ ] 6.2 Update `docs/projects/habitat-harness/workstream-record.md` so H4.5
  and H1-H8 closure language no longer overclaims current command proof.
- [ ] 6.3 Disposition stale current-proof wording in
  `docs/projects/habitat-harness/review-disposition-ledger.md`,
  `docs/projects/habitat-harness/discrepancy-log.md`, and
  `docs/projects/habitat-harness/FRAME.md` with patch/no-patch/deferred
  evidence in `workstream/downstream-realignment-ledger.md`.
- [ ] 6.4 Update Habitat README/command docs if command UX or selector failure
  output changes.
- [ ] 6.5 Record verification results and proof boundaries in this change's
  `workstream/phase-record.md`.
- [ ] 6.6 Commit via Graphite with a clean worktree.
