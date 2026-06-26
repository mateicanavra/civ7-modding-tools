# D6 Final Rereview: Code/Vendor Topology

Verdict: accepted for design/specification only.

No unresolved P1/P2 findings remain for this code/vendor topology lane. This is
not implementation acceptance. D6 source implementation remains blocked behind
concrete D0 compatibility rows, D1 output-family decisions where D6 touches live
output, and live D2 `ruleGritFacts` for Grit identity, scan metadata,
exclusions, hook eligibility where relevant, and malformed metadata output
families. No source code was implemented, no D6 packet/control files were
edited, and no commit was made.

## Scope Read

Required skill and workflow sources:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- Repo-local Civ7/OpenSpec/Habitat workstream guidance:
  - `.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
  - `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/grit-pattern-chain.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/proof-classes.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/review-and-realignment.md`
- Repo/process context:
  - `AGENTS.md` from the user-provided repo instructions; no closer
    `AGENTS.md` exists under `tools/`, `openspec/`, or
    `docs/projects/habitat-harness`
  - `.agents/skills/README.md`
  - `docs/process/GRAPHITE.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `docs/projects/habitat-harness/dra-takeover-frame.md`
  - `docs/projects/habitat-harness/recovery-claim-ledger.md`
  - relevant sections of `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

D6 packet/control files read:

- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/proposal.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/design.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/tasks.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md`
- Adjacent check: `openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/closure-checklist.md`

Grounding code/tests read:

- `tools/habitat/src/lib/grit.ts`
- `tools/habitat/src/lib/grit-failures.ts`
- `tools/habitat/src/lib/grit-injected-probe.ts`
- `tools/habitat/src/lib/habitat-process.ts`
- `tools/habitat/src/lib/grit-apply.ts`
- `tools/habitat/src/rules/rules.json`
- `tools/habitat/test/lib/grit-adapter.test.ts`
- `tools/habitat/test/lib/grit-injected-probe.test.ts`
- `tools/habitat/test/grit/grit-patterns.test.ts`

Vendor docs used:

- Grit CLI reference: https://docs.grit.io/cli/reference
- GritQL testing guide: https://docs.grit.io/guides/testing

## Commands Run

- `git status --short --branch`
  - Result: `## codex/d6-diagnostic-pattern-packet-repair`; no short-status
    entries. Branch confirmed before packet/code reads and writes.
- `find . -name AGENTS.md -print`
  - Result: no closer router under the touched `tools/`, `openspec/`, or
    `docs/projects/habitat-harness` paths.
- `wc -l` / `nl -ba` / `sed` over D6 packet/control files and grounding code
  - Result: packet/control and grounding code inspected with line numbers.
- `rg -n "DiagnosticCapabilityProjection|NativeGritFixture|fixture result|native fixture|DiagnosticConsumerProjection|DiagnosticCatalogEntry" openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog`
  - Result: found one undefined `DiagnosticCapabilityProjection` reference in
    `proposal.md`; recorded as P3 below.
- `find .habitat/patterns/active/checks -maxdepth 1 -type f -name '*.md' | wc -l`
  - Result: 32 current check pattern files.
- `find .habitat/patterns/active/apply -maxdepth 1 -type f -name '*.md' | wc -l`
  - Result: 3 current apply pattern files.
- `node -e "const r=require('./tools/habitat/src/rules/rules.json').rules; console.log('grit-check rules', r.filter(x=>x.ownerTool==='grit-check').length); console.log('missing gritPattern', r.filter(x=>x.ownerTool==='grit-check'&&!x.gritPattern).map(x=>x.id));"`
  - Result: 32 `grit-check` rules; no current `grit-check` rule is missing
    `gritPattern`.
- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
  - Result: exit 0; `Change 'deep-habitat-d6-diagnostic-pattern-catalog' is valid`.
- `git diff --check`
  - Result: exit 0; no whitespace errors.
- `gt status`
  - Result: Graphite delegated to `git status`; branch
    `codex/d6-diagnostic-pattern-packet-repair`; worktree clean before scratch
    write.
- `bun run openspec:validate`
  - Result: exit 0; full strict OpenSpec validation passed, 249 items passed and
    0 failed.

Focused Habitat tests were not run. They were not needed to decide this
design/spec topology lane because the task is packet acceptance, not source
implementation acceptance; the existing test files and required later gates
were inspected for path reality and coverage shape.

## Findings

No P1/P2 blockers.

The repaired D6 packet now covers the current code topology and likely D6 write
set without pulling D7, D8, D9, D11, or D13 source ownership into D6:

- Current `grit.ts` still mixes native invocation, scan roots, JSON/text parsing,
  docs apply-dry-run projection, cache/freshness options, whole `HarnessRule`
  projection, and pattern fallback (`tools/habitat/src/lib/grit.ts:119`,
  `tools/habitat/src/lib/grit.ts:126`,
  `tools/habitat/src/lib/grit.ts:536`,
  `tools/habitat/src/lib/grit.ts:600`,
  `tools/habitat/src/lib/grit.ts:605`,
  `tools/habitat/src/lib/grit.ts:626`,
  `tools/habitat/src/lib/grit.ts:682`).
  D6 names those as current-state defects and later refactor targets in
  `design.md:21`, `design.md:74`, `design.md:150`, `design.md:190`,
  `design.md:225`, `design.md:328`, and `design.md:358`.
- Current `grit-failures.ts` still contains D9 apply transaction tags in the
  broad exported failure family (`tools/habitat/src/lib/grit-failures.ts:3`,
  `tools/habitat/src/lib/grit-failures.ts:34`,
  `tools/habitat/src/lib/grit-failures.ts:85`). D6 explicitly forbids
  those tags in diagnostic acquisition/projection/probe target states and keeps
  broad compatibility facades behind D0 rows (`design.md:212`,
  `design.md:221`, `tasks.md:38`, `specs/habitat-harness/spec.md:87`).
- Current injected probe code still exposes proof-shaped `proofClass` and finds
  adapter failures by regex over rendered text
  (`tools/habitat/src/lib/grit-injected-probe.ts:38`,
  `tools/habitat/src/lib/grit-injected-probe.ts:50`,
  `tools/habitat/src/lib/grit-injected-probe.ts:370`). D6 replaces that
  target language with `InjectedProbeOutcome`, `validationClass`, structured
  failure projection, and D0/D1-only compatibility mapping (`design.md:252`,
  `design.md:275`, `specs/habitat-harness/spec.md:176`, `tasks.md:47`).
- D6's later write set is narrow and consistent with the files that currently
  own diagnostic acquisition/projection (`design.md:328`). It protects D5
  baselines, D7 report assembly, D8 governance, D9 apply transactions, D11 hook
  sequencing, D13 generator/manifest creation, and generated outputs
  (`design.md:346`).

The packet models Grit output contracts accurately enough for implementation:

- Official Grit docs define `grit check [PATHS]`, global `--json`, `grit apply
  --dry-run --output standard`, and `grit patterns test`. Current code uses the
  same command families (`tools/habitat/src/lib/grit.ts:428`,
  `tools/habitat/src/lib/grit.ts:293`,
  `tools/habitat/test/grit/grit-patterns.test.ts:30`).
- D6 preserves the needed distinctions among JSON diagnostics, docs text
  diagnostics, apply-dry-run-as-diagnostic-observation, and native fixture tests
  (`design.md:150`, `specs/habitat-harness/spec.md:60`,
  `specs/habitat-harness/spec.md:72`, `phase-record.md:64`).
- Current malformed/wrapper JSON behavior is treated as a bad case, not as a
  pass claim. Current parser and tests already fail closed
  (`tools/habitat/src/lib/grit.ts:587`,
  `tools/habitat/test/lib/grit-adapter.test.ts:51`,
  `tools/habitat/test/lib/grit-injected-probe.test.ts:364`), and D6
  makes that a target requirement (`specs/habitat-harness/spec.md:105`,
  `phase-record.md:66`, `review-disposition-ledger.md:36`).
- Later validation gates use real existing test paths for adapter, injected
  probe, and native Grit fixture coverage (`tasks.md:54`,
  `tasks.md:55`, `tasks.md:56`) and explicitly mark additional state-family
  tests as new required gates (`tasks.md:57`, `phase-record.md:69`).
- Native Grit fixture results are separated from current-tree Habitat outcomes
  and Pattern Governance: `phase-record.md:68`, `phase-record.md:81`,
  `downstream-realignment-ledger.md:16`, and
  `downstream-realignment-ledger.md:21` all preserve that boundary.

## P3 Tightenings

- P3: `proposal.md:91` names `DiagnosticCapabilityProjection`, but the repaired
  design/spec define `DiagnosticCatalogEntry` and `DiagnosticConsumerProjection`
  instead (`design.md:101`, `design.md:282`,
  `specs/habitat-harness/spec.md:5`). Repair shape: either rename the proposal
  reference to the defined capability/projection type or define an explicit
  alias in a later packet cleanup. This is not P1/P2 because the design and spec
  give implementation enough authority to use `DiagnosticCatalogEntry` plus
  consumer projections without inventing a domain decision.
- P3: `NativeGritCheckRequest` carries a `standard-apply-dry-run` output
  contract (`design.md:153`, `design.md:159`). Repair shape: consider renaming
  the future concrete type to `NativeGritDiagnosticRequest` so docs
  apply-dry-run observation reads as diagnostic acquisition, not check-only
  execution. This is not blocking because D6 already separates output contract
  from D9 apply safety and the protected-owner table forbids D9 inference
  (`design.md:296`, `design.md:300`, `downstream-realignment-ledger.md:17`).

## Non-Claims

- This review accepts D6 for design/specification only.
- This review does not accept or implement the D6 source changes.
- OpenSpec validation proves shape, not runtime behavior or implementation
  completion.
- Native Grit fixture success does not prove current-tree Habitat diagnostics,
  Pattern Governance admission, baseline authority, hook scope, or apply safety.
- No commit was made.

Skills used: domain-design, information-design, solution-design,
typescript-refactoring, civ7-open-spec-workstream, civ7-habitat-dra-workstream.
