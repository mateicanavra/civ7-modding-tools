# D6 Final Rereview: Code/Vendor Topology Latest Disk

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 remain for this latest-disk code/vendor topology lane. This
is not implementation acceptance. D6 source remains blocked behind D0 public
surface rows, D1 output-family/compatibility decisions where touched, and live
D2 `ruleGritFacts` projections.

## Sources Read

- Mandatory skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- Root router: `AGENTS.md`.
- D6 packet/control files:
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- Code/tests:
  - `tools/habitat-harness/src/lib/grit.ts`
  - `tools/habitat-harness/src/lib/grit-failures.ts`
  - `tools/habitat-harness/src/lib/grit-injected-probe.ts`
  - `tools/habitat-harness/src/lib/habitat-process.ts`
  - `tools/habitat-harness/src/rules/rules.json`
  - `tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - `tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
  - `tools/habitat-harness/test/grit/grit-patterns.test.ts`

## Commands Run

- `git status --short --branch` before reading: confirmed branch
  `codex/d6-diagnostic-pattern-packet-repair`; existing unstaged D6 packet/control
  edits and existing untracked rereview scratch files were present.
- `gt status`: passed through to `git status`; no separate Graphite stack state was
  reported by the command.
- `find openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog -maxdepth 3 -type f | sort`
- `find docs/projects/habitat-harness -name AGENTS.md -print`
- `find tools/habitat-harness -name AGENTS.md -print`
- `wc -l` over the D6 packet/control files and the required code/test files.
- `cat` for the mandatory skills and OpenSpec-workstream references listed above.
- `nl -ba` reads over every D6 packet/control file and targeted code/test ranges
  cited below.
- `rg -n` searches for Grit identity, parse, failure, scan-root, cache,
  injected-probe, command, and rule metadata terms across the required code/tests.
- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
  - Result: exit 0, change is valid.
- `git diff --check`
  - Result: exit 0.
- `bun run habitat check --tool grit-check --json`
  - Result: exit 0, `ok: true`; enforced Grit rules passed. Existing advisory
    `docs-local-checkout-paths` findings remain in historical scratch artifacts.
- `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts`
  - Result: exit 0, 1 file passed, native Grit samples pass.
- `bun run openspec:validate`
  - Result: exit 0, 249 OpenSpec items passed.

## Review Findings

No P1/P2 blockers.

The latest D6 packet now matches the current code/vendor topology as a
design/specification contract, not as a claim that source has been repaired:

- Identity topology is correctly source-blocked. Current code still projects from
  whole `HarnessRule` rows and falls back through `rule.gritPattern ?? rule.id`
  in `tools/habitat-harness/src/lib/grit.ts:600` and
  `tools/habitat-harness/src/lib/grit.ts:626`; `rules.json` still carries direct
  `gritPattern` fields such as `tools/habitat-harness/src/rules/rules.json:70`
  and `tools/habitat-harness/src/rules/rules.json:120`. D6 now forbids fallback
  identity and requires D2-backed `DiagnosticIdentity` in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:74`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:88`,
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:27`.
- Command-family topology is now closed enough for implementation. Current code
  has distinct JSON check, text check, and docs apply dry-run observation paths in
  `tools/habitat-harness/src/lib/grit.ts:126`,
  `tools/habitat-harness/src/lib/grit.ts:293`, and
  `tools/habitat-harness/src/lib/grit.ts:428`; tests pin these distinctions in
  `tools/habitat-harness/test/lib/grit-adapter.test.ts:235`,
  `tools/habitat-harness/test/lib/grit-adapter.test.ts:328`, and
  `tools/habitat-harness/test/lib/grit-adapter.test.ts:391`. D6 now names the
  closed native command families and output contracts in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:189`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:69`.
- Parsed acquisition is no longer allowed to smuggle unfinished command states.
  Current `GritCheckParseResult` still carries full `HabitatCommandResult` in
  `tools/habitat-harness/src/lib/grit.ts:45`; successful parse paths preserve full
  process detail in `tools/habitat-harness/src/lib/grit.ts:491` and
  `tools/habitat-harness/src/lib/grit.ts:738`. D6 now restricts parsed
  acquisition to `CompletedDiagnosticCommandObservation` in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:210`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:264`,
  with the normative scenario in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:111`.
- Adapter/apply failure ownership is repaired at the packet level. Current
  exports still include D9-owned `GritApply*` tags inside
  `GritAdapterFailureTag` at `tools/habitat-harness/src/lib/grit-failures.ts:3`
  and `tools/habitat-harness/src/lib/grit-failures.ts:34`. D6 now defines a
  diagnostic-only failure subset and explicitly forbids `GritApply*` states in
  diagnostic acquisition/projection/probe targets at
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:248`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:286`,
  with the spec scenario at
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:136`.
- Scan roots, cache, and freshness are now typed target states rather than text
  or option flags. Current code returns string/null scan-root failures in
  `tools/habitat-harness/src/lib/grit.ts:682` and uses cache flags/policies in
  `tools/habitat-harness/src/lib/grit.ts:60`,
  `tools/habitat-harness/src/lib/habitat-process.ts:39`, and
  `tools/habitat-harness/src/lib/grit.ts:396`. D6 closes scan-root decisions and
  cache observations in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:165`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:231`,
  with spec coverage in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:39`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:175`.
- Injected probes are repaired as diagnostic outcomes. Current code still uses
  proof-shaped language and can return `ok: true` with
  `cleanupRestoredStatus` as a boolean in
  `tools/habitat-harness/src/lib/grit-injected-probe.ts:38` and
  `tools/habitat-harness/src/lib/grit-injected-probe.ts:200`; it also parses
  adapter failure tags from rendered diagnostic messages in
  `tools/habitat-harness/src/lib/grit-injected-probe.ts:370`. D6 now makes
  successful probe observation require restored cleanup and moves dirty/not
  restored cleanup to failure context in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:327`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:203`.
- Findings states are now non-empty where they claim findings. The latest disk
  adds `NonEmptyReadonlyArray` to parsed findings reports, run outcomes, and
  consumer projections in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:270`,
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:314`,
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:381`;
  the spec requires the same in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:154`
  and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:238`.
- Native Grit fixtures remain correctly scoped as vendor/corpus evidence, not
  current-tree cleanliness or governance admission. The native fixture test runs
  `grit patterns test --json` in
  `tools/habitat-harness/test/grit/grit-patterns.test.ts:29`; D6 records the
  non-claim in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:73`
  and
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:21`.

## P3 Notes

- P3: `DiagnosticConsumerProjection` failure variants currently keep exact
  expected/unexpected/cache detail in `DiagnosticRunOutcome` and then collapse the
  consumer projection payload to `limitation` at
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:405`.
  That is acceptable for design/specification because raw outcome remains
  available, but implementation should consider carrying bounded failure-specific
  detail through consumer projections if D7/D8 need it without rejoining against
  the run outcome.
- P3: `docs-apply-dry-run-observation` is correctly distinguished from D9 apply
  transaction safety in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:192` and
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:286`.
  Implementation tests should preserve the word `observation` and the D9
  non-claim because current code's request kind is still `grit-apply` at
  `tools/habitat-harness/src/lib/grit.ts:297`.
- P3: `bun run habitat check --tool grit-check --json` is currently command-green
  but reports advisory docs-local-path findings in historical scratch artifacts.
  This does not block D6 packet acceptance, but those advisory docs findings
  should be cleaned before treating the full command output as a clean
  implementation gate.

## Non-Claims

- This rereview does not approve or implement source changes.
- This rereview does not accept current source as D6-complete.
- This rereview does not clear D0/D1/D2 source blockers.
- This rereview does not treat native Grit fixture success or current `habitat
  check` success as Pattern Governance admission, baseline authority, apply
  safety, or full current-tree cleanliness.

Skills used: domain-design, information-design, solution-design,
typescript-refactoring, civ7-open-spec-workstream.
