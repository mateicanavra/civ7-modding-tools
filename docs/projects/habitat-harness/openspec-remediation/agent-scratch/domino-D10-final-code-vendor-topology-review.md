# D10 Final Code/Vendor Topology Rereview

Reviewer: fresh D10 final code/vendor topology reviewer
Scope: design/specification acceptance only; no source implementation reviewed as target authority
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
Branch: `codex/d10-protected-zone-authority-packet`

## Sources Read

- Mandatory skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
  - Every file under `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/`
  - Every file under `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/`
- Repo/workstream routers:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- D10 packet and change:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D10-generated-protected-zone-authority.md`
  - Every file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d10-protected-zone-authority/`
- First-wave D10 scratch:
  - `domino-D10-code-topology-investigation.md`
  - `domino-D10-cross-domino-investigation.md`
  - `domino-D10-domain-ontology-investigation.md`
  - `domino-D10-openspec-information-investigation.md`
  - `domino-D10-typescript-state-investigation.md`
  - `domino-D10-vendor-validation-investigation.md`
- Current code/tests/config:
  - `tools/habitat-harness/src/lib/generated-zones.ts`
  - `tools/habitat-harness/scripts/verify-generated-zones.mjs`
  - `tools/habitat-harness/src/plugin.js`
  - `tools/habitat-harness/src/rules/rules.json`
  - `tools/habitat-harness/src/rules/architecture.ts`
  - `tools/habitat-harness/src/lib/grit.ts`
  - `tools/habitat-harness/src/lib/grit-apply.ts`
  - `tools/habitat-harness/src/lib/hooks.ts`
  - `tools/habitat-harness/src/lib/command-engine.ts`
  - `tools/habitat-harness/src/commands/check.ts`
  - `tools/habitat-harness/test/lib/biome-closure.test.ts`
  - `tools/habitat-harness/test/lib/hooks.test.ts`
  - `tools/habitat-harness/test/lib/grit-adapter.test.ts`
  - `biome.json`
  - `.gritignore`
  - `.habitat/grit.yaml`
- Official/native docs:
  - Grit config: `https://docs.grit.io/guides/config`
  - Grit CLI reference: `https://docs.grit.io/cli/reference`
  - GritQL patterns: `https://docs.grit.io/language/patterns`
  - Biome VCS integration: `https://biomejs.dev/guides/integrate-in-vcs/`
  - Biome configuration: `https://biomejs.dev/reference/configuration/`
  - Nx project configuration: `https://nx.dev/docs/reference/project-configuration`
  - Nx inputs reference: `https://nx.dev/docs/reference/inputs`
  - Nx caching: `https://nx.dev/docs/concepts/how-caching-works`
  - Git diff: `https://git-scm.com/docs/git-diff`

## Commands Run

| Command | Result | What it proves | Non-claim |
| --- | --- | --- | --- |
| `git status --short --branch` | Exit 0; branch `codex/d10-protected-zone-authority-packet`; preexisting untracked final D10 review files were present before this scratch was written. | Worktree/branch state recorded; my only intended write is this scratch file. | Does not validate D10 packet content. |
| `nx show target @internal/habitat-harness:generated:check --json` | Exit 0; target resolves to `bun tools/habitat-harness/scripts/verify-generated-zones.mjs`, `cache: false`, depends on `@swooper/mapgen-core:build` and `@civ7/map-policy:verify`, with generated/resource inputs. | Current Nx metadata matches the packet's generated-drift target assumptions. | Does not execute the drift target or prove generated freshness. |
| `bun run openspec -- validate deep-habitat-d10-protected-zone-authority --strict` | Exit 0; change is valid. | D10 OpenSpec shape passes strict validation. | Does not prove source implementation readiness. |
| `git diff --check` | Exit 0. | Diff whitespace hygiene is clean before this scratch write. | Does not validate D10 design completeness. |

I did not run source implementation gates, generated drift execution, hook execution, or broad `habitat check`; the review scope is design/specification only.

## Verdict

Code/vendor topology lane records no unresolved P1/P2 for repaired D10 design/specification. This lane result was not whole-packet acceptance by itself; whole-packet design/specification acceptance is now recorded by the later final domain/ontology rereview plus the promoted D10 control records and packet index.

## Findings

### P1

None.

### P2

None.

### P3

None for design/specification acceptance.

## Rationale

The repaired packet accounts for the current D10 code topology. `design.md` inventories the live surfaces that currently couple zone declarations, rule metadata, staged Git reads, hooks, Grit scan-root protection, Biome exclusions, generated drift, and D9 apply consumption (`design.md:11-22`). That inventory matches the current code: `generated-zones.ts` still holds host-specific `GeneratedZone[]` constants and staged Git parsing (`generated-zones.ts:17-69`, `generated-zones.ts:90-113`), `rules.json` still carries file-layer `generatedZone` and `forbiddenFileNames` rows (`rules.json:570-623`), Grit currently imports `generatedZones` and also keeps a separate protected-prefix list (`grit.ts:8`, `grit.ts:92-99`, `grit.ts:682-700`, `grit.ts:949-960`), Biome exclusions are mirrored in `biome.json` (`biome.json:8-26`), and `generated:check` is currently an Nx target around `verify-generated-zones.mjs` (`plugin.js:130-158`, `verify-generated-zones.mjs:7-38`).

The packet distinguishes mutation authorization from generated drift. `design.md:138-142` makes generated drift a separate consumer of `GeneratedSurfaceProjection` and native Nx target metadata, while `spec.md:83-95` states that drift checks do not authorize hand edits and staged refusals do not claim staleness. This repairs the first-wave blocker that staged file-layer refusal and generated drift were conflated.

The packet respects native tool authority instead of inventing a harness for the harnesses. `design.md:24-29` assigns Git staged identity, Grit scan/apply/ignore behavior, Biome format/lint/VCS selection, and Nx target/cache/input/dependency semantics to those tools. That matches official docs: Grit repository config and `.gritignore`/`.gitignore` behavior are native to Grit, Grit CLI owns check/apply invocation forms, Biome owns VCS changed/staged scope and `files.includes`, Nx owns target `cache`, `inputs`, `outputs`, and `dependsOn`, and Git diff with `--cached`/`-z` provides index-oriented, NUL-delimited path identity.

The write set and protected set are specific enough for design acceptance. `proposal.md:75-89` limits later source writes to D10 declaration/guard/projection wiring, the rule projection seam, command-engine staged guard consumption, Grit/Grit-apply/Hook consumers, generated drift wiring, and focused tests. It does not give D10 authority to redesign D7, D8, D9, D11, G-HOST, native tools, generated outputs, lockfiles, or dist/mod artifacts. `design.md:158-162` and `closure-checklist.md:22-36` reinforce the same boundary.

The packet remains generic rather than hard-coding Civ7/MapGen host policy as D10 truth. `proposal.md:30`, `proposal.md:37-44`, `design.md:46-50`, `design.md:80-84`, and `spec.md:22-35` require host-owned path facts, recovery actions, and missing-host-policy states to come from G-HOST. Because G-HOST is not accepted/live, D10 source implementation remains blocked for host-owned surfaces; that is a correct blocker, not an unresolved design P1/P2.

Validation gates are executable and matched to current reality. The repaired packet moved nonexistent or broad gates out of design acceptance and into later implementation gates: design-time validation is strict OpenSpec, optional full OpenSpec/corpus validation, diff hygiene, wording audit, and final rereviews (`proposal.md:104-121`, `design.md:164-182`, `phase-record.md:46-65`). Later implementation gates name the missing future tests as future work and include injected protected/generated/forbidden mutations, Grit scan-root tests, hook tests, generated drift target results, and D9 transaction tests (`tasks.md:51-69`, `spec.md:50-67`, `spec.md:83-95`, `spec.md:110-131`).

## Accepted / Rejected Rationale

Accepted:

- D10 now defines a closed declaration/request/decision model with required owner, recovery, path/action, conflict, missing-host, missing-D0, and non-claim facts (`design.md:96-127`, `spec.md:159-173`).
- D10 consumes D2 projections and G-HOST declarations instead of whole registry rows or host literals (`design.md:76-85`, `spec.md:22-49`).
- D7, D9, D11, generated drift, scan-root, and forbidden-artifact consumers receive named projections rather than re-owning D10 path policy (`design.md:86-95`, `spec.md:97-145`).
- D10 acceptance is explicitly design/specification only and not source implementation, generated freshness, hook safety, runtime/product proof, or D9 transaction success (`proposal.md:7`, `phase-record.md:78-84`, `closure-checklist.md:38-43`).

Rejected as acceptance blockers:

- G-HOST remains incomplete/live-blocking, but the repaired D10 packet records that as a source implementation blocker and missing-host decision state rather than pretending D10 can close host-specific policy itself.
- The current source still contains duplicated path authority, but this layer was not asked to implement source changes; the packet now makes preserving that topology a stop condition for later implementation (`proposal.md:91-103`, `design.md:184-192`).
- The source packet still contains older proof/gate language, but the repaired OpenSpec packet supersedes it as the executable D10 implementation-control artifact and records the source packet as controlling input, not finished output.

## Final Lane Line

Code/vendor topology rereview records no unresolved P1/P2 for repaired D10 design/specification in this lane. This lane result was not whole-packet acceptance by itself; whole-packet design/specification acceptance is now recorded by the later final domain/ontology rereview plus the promoted D10 control records and packet index.
