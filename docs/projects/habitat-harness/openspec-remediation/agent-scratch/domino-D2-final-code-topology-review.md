# D2 Final Code/Topology Rereview

## Verdict

Not accepted for design/specification yet.

D2 has repaired the prior P1 blockers in substance: the packet now contains a registry inventory, target ontology, versioned state model, facet contract, projection matrix, D0/D1 dependency inventory, write/protected sets, validation result shape, downstream projection rows, and expanded OpenSpec requirements. I found no remaining P1 blocker in the core D2 model.

However, the current code topology still exposes two P2 blockers. They are narrow, but they matter because D2's acceptance bar is "no unresolved accepted P1/P2 findings." The packet index should not mark D2 accepted until these are repaired or explicitly source-rejected with evidence.

## Review Lane

Final code/topology review only. I did not implement source code and did not edit D2 packet files.

Scope checked:

- current code surfaces and registry consumers;
- likely source write set and protected paths;
- consumer projection coverage;
- public/durable surface blockers;
- validation oracles;
- OpenSpec structural validation.

## Sources Read

- Required skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - repo-local `.agents/skills/typescript-refactoring/SKILL.md`
  - repo-local TypeScript refactoring references: `smell-catalog.md`, `refactoring-mechanics.md`, `paradigms-and-patterns.md`, `llm-slop-cleanup.md`, `worked-examples.md`
- Repo/workstream routing:
  - `AGENTS.md`
  - `.agents/skills/README.md`
  - `.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
  - `.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
  - `.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
  - `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/review-and-realignment.md`
- D2 packet and controls:
  - `docs/projects/habitat-harness/openspec-remediation-frame.md`
  - `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
  - all D2 workstream files
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
  - all fresh D2 investigation docs under `agent-scratch/domino-D2-*-investigation.md`
- Current code evidence:
  - `tools/habitat/src/rules/architecture.ts`
  - `tools/habitat/src/rules/rules.json`
  - `tools/habitat/src/plugin.js`
  - `tools/habitat/src/lib/command-engine.ts`
  - `tools/habitat/src/lib/baseline.ts`
  - `tools/habitat/src/lib/grit.ts`
  - `tools/habitat/src/lib/grit-injected-probe.ts`
  - `tools/habitat/src/lib/generated-zones.ts`
  - `tools/habitat/src/lib/hooks.ts`
  - `tools/habitat/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat/src/generators/pattern/generator.cjs`
  - `tools/habitat/src/generators/pattern/registration.cjs`
  - `tools/habitat/src/index.ts`
  - focused tests discovered by current imports and packet gates

## What Is Repaired

- Prior P1 facet/projection blocker: repaired by `design.md` Current Diagnosis, Target Ontology, Target Type Model, Registry Field Inventory, Facet Contract, Consumer Projection Matrix, and `spec.md` requirements.
- Prior P1 D0/D1 compatibility blocker: repaired for design/specification by `design.md` D0/D1 dependency inventory and explicit source-implementation block until concrete D0 rows exist.
- Prior P1 spec thinness blocker: repaired by separate normative requirements for schema, terms, projections, selectors, routing, graph, baseline, Grit, generated-zone, governance, malformed metadata, and downstream consumption.
- Prior P2 downstream genericity blocker: repaired by per-consumer rows in the downstream ledger.
- Prior P2 terminology/domain leakage blocker: repaired by D2 owns/does-not-own boundaries plus term disposition.
- Prior P2 task-shape blocker: mostly repaired by ordered model, projection, consumer migration, deletion, compatibility, validation, and review tasks.

## P2 Findings

### P2-1: Current `grit-injected-probe` registry consumer is not in the approved write set or migration slice

`design.md` forbids whole-record crossing where a projection exists and names `ruleGritFacts` as the projection for Grit adapter/D6/D8/hooks consumers. It also lists the later D2 implementation write set at `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:245`. That write set includes `grit.ts` but omits `tools/habitat/src/lib/grit-injected-probe.ts`.

Current code shows `grit-injected-probe.ts` is a direct registry consumer:

- `tools/habitat/src/lib/grit-injected-probe.ts:4` imports `HarnessRule`, `ruleById`, and `rules`.
- `tools/habitat/src/lib/grit-injected-probe.ts:34` accepts a `registry?: readonly HarnessRule[]`.
- `tools/habitat/src/lib/grit-injected-probe.ts:81` defaults to the global `rules`.
- `tools/habitat/src/lib/grit-injected-probe.ts:82`-`83` finds a whole rule by id.
- `tools/habitat/src/lib/grit-injected-probe.ts:261`-`267` reads `gritPattern` directly from the registry and compares it to the injected probe pattern identity.

This is exactly the kind of consumer-local registry read D2 is supposed to collapse into named projections. The packet does require `test/lib/grit-injected-probe.test.ts` in validation, but the source file is outside the named write set and outside the consumer migration tasks. A later implementer could either leave this whole-row consumer in place or be forced outside the packet write set to repair it.

Required repair: add `tools/habitat/src/lib/grit-injected-probe.ts` to the D2 implementation write set and add an implementation task requiring injected-probe behavior to consume `ruleGritFacts`/registry projections rather than `HarnessRule`, `rules`, `ruleById`, or raw `gritPattern`. If D2 intentionally excludes it as D6-owned, the packet must say so and move the required write/test ownership to D6; the current D2 validation gate already pulls it into D2.

### P2-2: Hook/local-feedback public surface is named as impacted but lacks a hook-specific validation gate

`design.md` identifies hook/local feedback output as a D0 public/durable surface impacted by D2 at `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:227`, and the projection matrix names `ruleLocalFeedbackFacts` for hooks/D11 at `design.md:193`. `tasks.md:42` requires migrating hook/local-feedback selection to `ruleLocalFeedbackFacts`.

Current hook code is a command-facing surface:

- `tools/habitat/src/lib/hooks.ts:247`-`259` shells out to `habitat check --staged --tool file-layer --json`.
- `tools/habitat/src/lib/hooks.ts:350`-`368` shells out to `habitat check --staged --tool grit-check --json`.
- `tools/habitat/src/lib/hooks.ts:371`-`393` parses check-report JSON and turns Grit parse failures/findings into hook outcomes.
- `tools/habitat/test/lib/hooks.test.ts:787`-`825` fixtures command-facing hook JSON containing `ownerTool`, `lane`, `detect`, `message`, and `remediate`.

D2's implementation validation list covers rule selection, classify, baseline, Grit adapter/probe, enforcement surface, generator, Pattern Authority, `habitat classify`, `habitat check -- --json`, `nx show project`, OpenSpec validation, and whitespace. It does not include `tools/habitat/test/lib/hooks.test.ts` or another hook-specific oracle. Because D2 itself names hook/local-feedback output and `ruleLocalFeedbackFacts`, the implementation gates should include a hook test proving D2's eligibility metadata changes do not drift hook command behavior or silently reinterpret registry fields through check-report JSON.

Required repair: add `bun run --cwd tools/habitat test -- test/lib/hooks.test.ts` or an equivalent hook/local-feedback oracle to `tasks.md`, `proposal.md`, and the phase-record validation table. The non-claim should state this proves hook-facing D2 metadata compatibility only, not D11 hook behavior closure.

## Validation Run During Rereview

Commands run:

| Command | Result | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` | passed; change valid | structural OpenSpec shape only |
| `bun run openspec:validate` | passed; `249 passed, 0 failed` | all OpenSpec records validate structurally only |
| `git diff --check` | passed | whitespace only |
| `gt status` | passed through to `git status`; existing dirty/untracked remediation state remains | Graphite presence/status only, not stack closure |

Current repo state before writing this scratch doc already had modified `AGENTS.md` and untracked remediation/OpenSpec packet files. I did not modify source code or D2 packet files.

## Packet Index Decision

The packet index cannot mark D2 accepted for design/specification yet. The correct row remains "repaired after fresh D2 investigations; final per-domino rereview required before acceptance; not implementation-complete" until the two P2 findings above are repaired or source-rejected.

After repair, D2 can likely be accepted for design/specification only. Source implementation must still remain blocked until concrete D0 surface rows exist for every D2-touched public/durable surface and D1 malformed metadata output families are cited.

## Skills Used

Skills used: domain-design, information-design, solution-design, typescript-refactoring, civ7-open-spec-workstream, civ7-habitat-dra-workstream.
