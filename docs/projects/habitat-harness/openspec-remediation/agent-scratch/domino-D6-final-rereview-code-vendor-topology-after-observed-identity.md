# D6 Final Rereview: Code/Vendor Topology After Observed-Identity Repair

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 remain for this D6 code/vendor topology lane after the
observed-identity repair. This is not implementation acceptance. D6 source
implementation remains blocked behind concrete D0 public/durable surface rows,
D1 output-family/compatibility decisions where touched, and live D2
`ruleGritFacts` projections.

## Sources Read

- User-provided root `AGENTS.md` instructions for this repo.
- Mandatory skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- D6 packet/control files:
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
  - `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- Prior D6 scratch context read for continuity:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-code-vendor-topology-latest.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-domain-ontology-latest.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-typescript-validation-after-repair.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-openspec-information-after-repair.md`
- Grounding code/tests:
  - `tools/habitat/src/lib/grit.ts`
  - `tools/habitat/src/lib/grit-failures.ts`
  - `tools/habitat/src/lib/grit-injected-probe.ts`
  - `tools/habitat/src/lib/habitat-process.ts`
  - `tools/habitat/src/rules/rules.json`
  - `tools/habitat/test/lib/grit-adapter.test.ts`
  - `tools/habitat/test/lib/grit-injected-probe.test.ts`
  - `tools/habitat/test/grit/grit-patterns.test.ts`

## Commands Run

- `git status --short --branch`
  - Confirmed required branch: `codex/d6-diagnostic-pattern-packet-repair`.
  - Existing unstaged D6 packet/control edits and prior untracked scratch reports
    were already present before this rereview.
- `find openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog -maxdepth 4 -type f | sort`
- `find . -name AGENTS.md -print`
- `wc -l` over the TypeScript-refactoring references and the required code/test
  files.
- `sed -n` / `nl -ba` reads over mandatory skill files, TypeScript references,
  D6 packet/control files, prior scratch context, and targeted code/test ranges.
- `rg -n` over Grit identity, command, failure, scan-root, cache, probe, and
  projection terms in the required code/tests.
- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
  - Result: exit 0, `Change 'deep-habitat-d6-diagnostic-pattern-catalog' is valid`.
- `git diff --check`
  - Result: exit 0.
- `git diff --check` after writing this report
  - Result: exit 0.
- `git status --short --branch` after writing this report
  - Confirmed branch remained `codex/d6-diagnostic-pattern-packet-repair`.
  - Only this requested scratch report was added by this rereview; the D6
    packet/control edits and other untracked scratch files were pre-existing.
- `wc -l docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-rereview-code-vendor-topology-after-observed-identity.md`

## P1/P2 Findings

None.

The latest D6 packet now aligns with current Habitat/Grit code and native Grit
command behavior as a design/specification contract. It does not claim the
current source has already implemented D6.

## Acceptance Evidence

Observed identity is now correctly separated from accepted diagnostic identity.
Current source still treats native `local_name` and parsed `check_id` as direct
matching evidence in `tools/habitat/src/lib/grit.ts:806` through
`tools/habitat/src/lib/grit.ts:813`, and current tests still exercise
that direct evidence in `tools/habitat/test/lib/grit-adapter.test.ts:33`
through `tools/habitat/test/lib/grit-adapter.test.ts:48` and
`tools/habitat/test/lib/grit-adapter.test.ts:143` through
`tools/habitat/test/lib/grit-adapter.test.ts:173`. The repaired D6
design now defines accepted `DiagnosticIdentity` separately from raw
`ObservedDiagnosticIdentity` in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:132`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:160`,
requires observed evidence to match selected identity before projection in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:89`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:99`,
and normatively covers `local_name` / parsed `check_id` disagreement in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:177`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:184`.
That is the right topology: source remains unrepaired, while the target model no
longer forces implementation to coerce raw vendor evidence into accepted catalog
identity.

Pattern identity fallback remains correctly source-blocked. Current projection
still uses whole `HarnessRule` rows and `rule.gritPattern ?? rule.id` in
`tools/habitat/src/lib/grit.ts:600` through
`tools/habitat/src/lib/grit.ts:647`; `rules.json` still contains direct
`gritPattern` fields such as
`tools/habitat/src/rules/rules.json:70` through
`tools/habitat/src/rules/rules.json:82` and
`tools/habitat/src/rules/rules.json:754` through
`tools/habitat/src/rules/rules.json:765`. D6 now forbids missing
identity fallback in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:107`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:115`,
requires valid D2 Grit facts before accepting catalog entries in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:89`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:95`,
and keeps source implementation blocked until live D2 projections exist in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:21`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:24`.

Vendor command families and output contracts match observed Grit behavior
without overclaiming. Current code has distinct JSON check, text check, and docs
apply dry-run paths in `tools/habitat/src/lib/grit.ts:359` through
`tools/habitat/src/lib/grit.ts:460` and
`tools/habitat/src/lib/grit.ts:293` through
`tools/habitat/src/lib/grit.ts:323`. Tests pin JSON check argv in
`tools/habitat/test/lib/grit-adapter.test.ts:235` through
`tools/habitat/test/lib/grit-adapter.test.ts:279`, docs dry-run standard
output in `tools/habitat/test/lib/grit-adapter.test.ts:328` through
`tools/habitat/test/lib/grit-adapter.test.ts:369`, and mixed source/docs
splitting in `tools/habitat/test/lib/grit-adapter.test.ts:391` through
`tools/habitat/test/lib/grit-adapter.test.ts:465`. D6 names closed
command families and output contracts in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:211`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:230`
and forbids bare string command-family authority in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:82`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:89`.

Parsed acquisition is now completed-only at the target boundary. Current
`GritCheckParseResult` still carries full `HabitatCommandResult` on parsed
success in `tools/habitat/src/lib/grit.ts:45` through
`tools/habitat/src/lib/grit.ts:58`, with parsed returns at
`tools/habitat/src/lib/grit.ts:491` through
`tools/habitat/src/lib/grit.ts:499` and
`tools/habitat/src/lib/grit.ts:738` through
`tools/habitat/src/lib/grit.ts:746`. D6 now restricts parsed acquisition
to `CompletedDiagnosticCommandObservation` in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:232`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:251`
and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:286`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:289`,
with the normative parsed-report scenario at
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:111`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:117`.

The adapter/apply ownership split is still correctly modeled as a later D6
implementation slice, not current source behavior. Current exported failure tags
include D9-owned `GritApply*` states in
`tools/habitat/src/lib/grit-failures.ts:3` through
`tools/habitat/src/lib/grit-failures.ts:22` and
`tools/habitat/src/lib/grit-failures.ts:34` through
`tools/habitat/src/lib/grit-failures.ts:50`; tests currently require
every broad accepted tag to render in
`tools/habitat/test/lib/grit-adapter.test.ts:577` through
`tools/habitat/test/lib/grit-adapter.test.ts:592`. D6 now defines the
diagnostic-only subset and explicitly excludes `GritApply*` target states in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:270`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:319`,
while allowing compatibility facades only with D0 backing.

Scan-root and cache behavior are correctly converted from current string/flag
mechanics into target state families. Current `validateScanRoots()` returns
string/null refusals in `tools/habitat/src/lib/grit.ts:682` through
`tools/habitat/src/lib/grit.ts:700`; current process records expose
cache policy fields in `tools/habitat/src/lib/habitat-process.ts:39`
through `tools/habitat/src/lib/habitat-process.ts:43` and
`tools/habitat/src/lib/habitat-process.ts:55` through
`tools/habitat/src/lib/habitat-process.ts:72`. Tests cover the present
families in `tools/habitat/test/lib/grit-adapter.test.ts:213` through
`tools/habitat/test/lib/grit-adapter.test.ts:232`,
`tools/habitat/test/lib/grit-adapter.test.ts:282` through
`tools/habitat/test/lib/grit-adapter.test.ts:305`, and
`tools/habitat/test/lib/grit-adapter.test.ts:488` through
`tools/habitat/test/lib/grit-adapter.test.ts:508`. D6 closes the target
scan-root and cache states in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:187`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:209`
and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:253`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:268`.

Injected probes are now target-modeled as diagnostic outcomes with restored-only
success. Current source still exposes proof-shaped language and booleans in
`tools/habitat/src/lib/grit-injected-probe.ts:38` through
`tools/habitat/src/lib/grit-injected-probe.ts:53`, computes cleanup as a
boolean in `tools/habitat/src/lib/grit-injected-probe.ts:200` through
`tools/habitat/src/lib/grit-injected-probe.ts:222`, and parses adapter
failure tags out of rendered messages in
`tools/habitat/src/lib/grit-injected-probe.ts:370` through
`tools/habitat/src/lib/grit-injected-probe.ts:377`. Tests cover the
current probe happy path and cleanup in
`tools/habitat/test/lib/grit-injected-probe.test.ts:26` through
`tools/habitat/test/lib/grit-injected-probe.test.ts:71`, probe-only root
behavior in `tools/habitat/test/lib/grit-injected-probe.test.ts:346`
through `tools/habitat/test/lib/grit-injected-probe.test.ts:358`, and
adapter-failure cleanup in
`tools/habitat/test/lib/grit-injected-probe.test.ts:364` through
`tools/habitat/test/lib/grit-injected-probe.test.ts:387`. D6 now
requires `cleanup: "restored"` for `probe-diagnostic-observed` and moves dirty
or not-restored cleanup into `probe-cleanup-failed` at
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:354`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:389`,
with matching spec language in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:214`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md:223`.

Findings states are non-empty wherever the target state claims findings. Current
source still uses ordinary arrays where empty findings can represent clean
results in `tools/habitat/src/lib/grit.ts:624` through
`tools/habitat/src/lib/grit.ts:647`, and tests intentionally preserve
current clean empty arrays in
`tools/habitat/test/lib/grit-adapter.test.ts:176` through
`tools/habitat/test/lib/grit-adapter.test.ts:180` and
`tools/habitat/test/lib/grit-adapter.test.ts:372` through
`tools/habitat/test/lib/grit-adapter.test.ts:388`. The repaired D6
target uses `NonEmptyReadonlyArray` for findings reports, findings run outcomes,
and findings consumer projections in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:293`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:305`,
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:336`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:343`,
and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:399`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:415`.

Native Grit fixture tests remain properly scoped as vendor/corpus behavior. The
native corpus test runs `grit patterns test --json` in
`tools/habitat/test/grit/grit-patterns.test.ts:29` through
`tools/habitat/test/grit/grit-patterns.test.ts:54`. D6 records that
native fixture success is not current-tree diagnostic cleanliness in
`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:21`
and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:73`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:75`.

Validation gates match the current code/vendor risk. The packet requires focused
adapter, injected-probe, native Grit fixture, D2 projection, scan-root,
cache/freshness, structured adapter projection, command JSON, and cleanup gates
in `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:56`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md:71`
and `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:69`
through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md:81`.
Design-time validation passed under OpenSpec strict validation and `git diff
--check`.

## P3 Notes

- P3: The current source and tests use `GritUnexpectedPatternIdentity`
  (`tools/habitat/src/lib/grit-failures.ts:11` through
  `tools/habitat/src/lib/grit-failures.ts:12`) while the D6 target
  diagnostic subset uses `GritUnexpectedDiagnosticIdentity`
  (`openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:273`
  through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:284`).
  This is acceptable for design/specification because D6 already requires D0
  compatibility handling for exported adapter types, but implementation should
  make the compatibility mapping explicit rather than silently renaming the
  public tag.
- P3: The grouped consumer projection for `projection-missed`,
  `unexpected-diagnostic-identity`, and `cache-observation-missing` carries only
  `limitation` in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:432`
  through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:438`.
  The richer `DiagnosticRunOutcome` still carries exact expected, unexpected,
  and cache-observation details in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:336`
  through `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md:343`,
  so this is not blocking. Implementation should confirm whether D7/D8/D11 can
  consume the reduced projection without rejoining against the run outcome.
- P3: `proposal.md` still names `DiagnosticCapabilityProjection` as a D8 input in
  `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md:91`,
  while `design.md` primarily defines `DiagnosticCatalogEntry`,
  `DiagnosticRunOutcome`, `InjectedProbeOutcome`, and
  `DiagnosticConsumerProjection`. This does not confuse code/vendor topology, but
  a later control pass should either define that as an alias or align the term.

## Non-Claims

- This rereview does not implement source code.
- This rereview does not accept current source as D6-complete.
- This rereview does not authorize edits to D6 packet/control files.
- This rereview does not clear D0/D1/D2 implementation blockers.
- This rereview does not treat native Grit fixture success, current adapter tests,
  or current command success as Pattern Governance admission, baseline authority,
  apply safety, hook sequencing, or full current-tree cleanliness.

Skills used: domain-design, information-design, solution-design,
typescript-refactoring.
