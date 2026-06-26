# D13 Final Code/Vendor Topology Review

Reviewer: fresh final D13 code/vendor topology rereviewer
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
Branch observed: `codex/d13-scaffolding-refusal-packet`
Change: `deep-habitat-d13-scaffolding-refusal-contracts`

## Verdict

Accepted for design/specification only from the code/vendor topology lane.

I reread the current repaired disk state after the post-cleanup control refresh, including the updated `proposal.md` and the cleaned first-wave OpenSpec scratch. The current packet matches the real Habitat generator topology closely enough for design/specification acceptance: it uses Nx generator surfaces rather than inventing `habitat generate`, it treats the project schema's extra enum values as compatibility/refusal inputs rather than generic Habitat authority, it preserves candidate-only vs D8-registered Pattern Governance boundaries, and it keeps host/Authoring Topology behavior source-blocked behind G-HOST and D14.

No unresolved P1/P2 blockers remain from this code/vendor topology rereview. This does not authorize TypeScript/source implementation, pattern registration, host-specific scaffolding, Authoring Topology implementation, protected/generated-zone writes, or public-surface compatibility changes without the named D0/D2/D8/G-HOST/D10/D14 inputs.

Post-fix audit state: per control refresh, the exact forbidden-term audit over the D13 change, packet index, context, and D13 scratch files is clean after the final first-wave OpenSpec scratch line cleanup. I also reran `git diff --check`, strict D13 OpenSpec validation, and full OpenSpec validation after rereading current disk; all passed.

## Files Read

Repaired D13 packet/control files:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-openspec-information-testing-investigation.md`

Current topology and tests:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/generators.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/package.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/schema.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/schema.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/generator.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/project-generator.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/pattern-generator.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/migration-boundary.test.ts`

Mandatory anchoring read before task work:

- Domain Design skill
- Information Design skill
- Solution Design skill
- Testing Design skill
- Repo-local TypeScript Refactoring skill
- Root `AGENTS.md`
- Repo-local Civ7 OpenSpec Workstream skill

## Commands And Vendor Docs Consulted

Commands:

- `git status --short --branch`: confirmed target branch and existing dirty/untracked work; treated prior packet/scratch edits as existing work.
- `git diff --check`: exit 0.
- `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`: exit 0, D13 change valid.
- `bun run openspec:validate`: exit 0, 249 OpenSpec items passed.
- `rg` scans over D13 packet/control/docs for `habitat generate`, candidate/registered wording, Grit/Biome/Nx references, and reduced-standard audit-adjacent terms. Broad grep hits remain in historical first-wave scratch and in the current design's explicit rejection of `habitat generate`; these are not active D13 gates and are not the exact forbidden-term audit.

Vendor docs:

- Official Nx local generator docs: `https://nx.dev/docs/extending-nx/local-generators`
- Official Nx command reference: `https://nx.dev/docs/reference/nx-commands`
- Official Grit configuration docs: `https://docs.grit.io/guides/config`
- Official Grit custom patterns docs: `https://docs.grit.io/guides/patterns`

Vendor mechanics conclusion: Nx generator invocation through `nx g`/`nx generate`, package `generators.json` factory/schema metadata, and dry-run validation are the right surfaces for D13. Grit pattern files under `.grit/patterns` are active-load surfaces, so D13 is correct to keep candidate drafts outside active `.grit` registration and to require D8-governed promotion before active Grit/rule-pack/baseline/hook/apply state.

## Findings

No unresolved P1/P2 findings.

The repaired packet correctly repairs the prior code/vendor blockers:

- No invented `habitat generate` gate remains. `design.md` explicitly rejects `bun run habitat generate --help` as a D13 gate, and `proposal.md`/`spec.md`/`tasks.md` use Nx generator dry-runs and generator tests instead.
- The project generator topology is represented accurately. Current code supports only `plugin`, `foundation`, and `app` write contracts, strips optional `kind:` prefixes, and runtime-refuses other schema-admitted names before writes.
- The project schema's admitted `adapter`, `control`, `engine`, `mod`, `sdk`, and `tooling` values are treated as compatibility/refusal surfaces, not as generic Habitat taxonomy.
- Pattern candidate vs registered behavior is separated. Current candidate generation writes only candidate markdown and candidate manifest paths under `tools/habitat-harness/src/rules/pattern-authority/candidates`; registered lifecycles route through `registration.cjs` and Pattern Authority manifest validation before active `.grit`/`rules.json` writes.
- D8 remains the owner of registration/admission semantics. The packet protects `.habitat/patterns/active/checks/**`, `rules.json`, baselines, and `pattern-authority/manifest.ts` except through D8-governed paths.
- G-HOST and D14 are not smuggled into current schemas. Host-specific source behavior remains blocked behind G-HOST, and the proposal now correctly states that D13 owns only the generic refusal envelope while D14 owns authoring-specific blocked actions, future criteria, and recovery semantics.
- The write/protected set is safe for later implementation. It scopes edits to generator schemas, generator implementation, registration refusal projection, generator tests, relevant docs, and D13/D0 control files, while protecting active Grit, baselines, generated artifacts, lockfiles, MapGen/Civ packages, and Authoring Topology paths.
- Biome/Grit mechanics are represented at the right level. D13 does not move formatting or ordinary hygiene into the scaffolding packet, and it treats Grit active pattern loading as a protected registration concern rather than candidate scaffolding output.

## P3 Notes

- `generators.json` still says the pattern generator scaffolds a matching rule-pack entry. The packet properly classifies this as a D0 public-surface compatibility issue and blocks later correction/facading behind D0 rows; this is not a design/spec blocker.
- Current implementation errors remain thrown strings rather than the full structured D13 refusal envelope. The packet correctly leaves this as later source implementation work gated by D0/public compatibility handling; this is not a design/spec blocker.
- The final packet index still marks D13 as incomplete because other final rereview lanes must also close. This code/vendor topology review does not update packet-index status by itself.
- The exact forbidden-term audit is recorded as clean from the post-fix control refresh. My broader `rg` scan is not the canonical audit and still finds historical first-wave discussion of repaired issues.

## Exact Acceptance Statement

D13 can be accepted for design/specification only from the code/vendor topology lane. No unresolved P1/P2 code/vendor topology blockers remain against the current repaired disk state.

D13 must not be accepted as implementation-complete. Later source implementation remains blocked behind concrete D0 rows for touched public generator/help/output/docs/export surfaces, live D2/D8 projections where consumed, G-HOST declarations for host-owned behavior, D10 protected/generated-zone decisions where touched, and D14 early-fence language for authoring-specific refusals.
