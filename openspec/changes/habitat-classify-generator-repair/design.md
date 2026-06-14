# Design - Classify And Generator Repair

## Frame

### Objective

Make `habitat classify` and the Habitat generators truthful agent-routing
surfaces: classify reports current-resolved owners, rules, and targets, and
generators create only supported structure with proved kind/root/target
contracts.

### Product Movement

This moves Habitat toward the repo-local executable structural operating system
by making the first agent action reliable. An agent should be able to classify a
path or diff, see what owns it, see runnable commands that exist now, and know
whether new structure should be generated or escalated to a domain owner.

### Selection

This frame selects:

- classify ownership and target reporting;
- path-aware rule-scope reporting;
- project generator support and refusal boundaries;
- migration capability claims;
- README/AGENTS classify/generator guidance.

### Foreground

- Resolved Nx metadata over static target strings.
- Path-specific rule scope over owner-level rule floods.
- Supported generator contracts over directory guesses.
- Current command proof over H8 historical closure.
- Separate pattern-generator metadata ownership.

### Exterior

- Grit pattern semantics, baselines, and current-tree proof.
- Hook side effects.
- Biome write semantics.
- Taxonomy policy changes.
- Domain-specific generator designs for non-uniform kinds.
- Product/runtime Civ7 behavior.

### Hard Core

1. `classify` must not emit commands for targets Nx cannot resolve.
2. `classify` must distinguish project-local targets from workspace/Habitat
   structural gates.
3. Rule-scope output must explain why a rule applies to the path, project, or
   workspace, or mark the scope unresolved.
4. Generators must refuse unsupported kinds, unsupported roots, and mismatched
   kind/root pairs before writes.
5. Migration capability must be tied to a concrete convention change, not only
   a no-op wiring proof.

### Structural Alternative Considered

Alternative: keep classify simple and tell agents that reported targets are
recommendations to double-check manually.

Rejected because classify is the front door for agent operation. If the front
door can emit nonexistent targets, downstream agents learn to distrust the
harness and revert to hand-invented verification. The repair must make target
truth structural, not advisory prose.

### Falsifier

This design fails if implementation can classify `packages/civ7-adapter` and
still report `@civ7/adapter:test` while `nx show target @civ7/adapter:test`
rejects the target.

## Current Diagnosis

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Project lookup | `classifyPath` manually scans `apps`, `packages`, `packages/plugins`, `mods`, and `tools` for `package.json`. | Ownership is derived outside Nx's resolved project graph. |
| Project targets | `projectTargets()` always returns `<project>:check` and `<project>:test`. | Target reporting can overclaim. |
| Fresh target proof | `classify packages/civ7-adapter/src/index.ts` reports `@civ7/adapter:test`; `nx show target @civ7/adapter:test` exits 1. | Resolved Nx metadata must gate every emitted target command. |
| Workspace targets | `workspaceTargets()` returns fixed Habitat/Nx commands. | These must be separately validated as cross-repo gates. |
| Rule scope | `rulesInScope` includes owner-project rules plus every `@internal/habitat-harness` rule. | Agents cannot tell exact path scope from broad workspace scope. |
| Diff classify | Literal diff paths are extracted and classified independently. | Diff support is real, but each path row needs resolved target and scope truth. |
| Project generator | Supports `plugin`, `foundation`, and `app`; refuses other kinds with rationale. | Refusal boundary is real and must be preserved. |
| Generator root override | `--kind=app --directory=packages/... --dry-run` plans files under `packages/...`. | Supported kind does not currently prove kind/root alignment. |
| Migration | `migrations.json` declares a no-op migration. | H8 migration wiring is historical proof, not broad convention-change proof. |
| Agent guidance | Root AGENTS and README tell agents to classify, generate supported projects, and generate Grit-backed rules. | Guidance must be realigned with target proof and pattern metadata gates. |

Fresh command evidence:

```text
bun run habitat classify packages/civ7-adapter/src/index.ts
bun run nx show project @civ7/adapter --json
bun run nx show target @civ7/adapter:test
bun run nx show projects --with-target test --json
bun run nx g @internal/habitat-harness:project unsupported-mod-probe --kind=mod --dry-run
bun run nx g @internal/habitat-harness:project misplaced-probe --kind=app --directory=packages/misplaced-app-probe --dry-run
```

The first command reports both `@civ7/adapter:check` and
`@civ7/adapter:test`. The resolved project has `build`, `check`, and
`nx-release-publish` targets. The target probe rejects `@civ7/adapter:test`.
The unsupported `mod` generator refuses before writes, while the mismatched
app-in-packages dry-run currently plans file creation.

A local package inventory found four projects without package `test` scripts:
`@civ7/adapter`, `@civ7/types`, `@swooper/mapgen-viz`, and `civ-mod-dacia`.
Static `:test` emission is therefore a class defect, not an isolated adapter
case.

## Implementation Sequencing Boundary

This packet can be reviewed as a classify/generator contract now. Canonical
classify command proof must still consume `habitat-oclif-entrypoint-repair`
before implementation closure, because the root/dev command surface currently
has known help and selector-truth blockers. This packet owns classify output
semantics and generator support boundaries; it does not absorb root command
dispatch or invalid rule/tool selector behavior.

## System Dynamics

Reinforcing loop:

1. Agent runs `habitat classify` because docs say classify first.
2. Classify emits static targets and broad rules.
3. Agent treats output as current repo truth.
4. A nonexistent target or irrelevant rule causes failed verification, skipped
   verification, or manual routing.
5. Future agents trust Habitat less and hand-invent paths again.

Balancing loop introduced by this repair:

1. Classify consumes resolved Nx project metadata.
2. Every emitted target has target-existence proof.
3. Rule scope names exact path, project, workspace, or unresolved scope.
4. Generator support is proved by scratch generation and Nx discovery.
5. Agent guidance becomes executable instead of aspirational.

## Resolved Target Contract

Implementation must introduce a target contract equivalent to:

```ts
type ClassifiedTarget = {
  command: string;
  owner: "project" | "workspace" | "habitat";
  project: string | null;
  target: string;
  proof:
    | { kind: "nx-show-target"; command: string; result: "resolved" }
    | { kind: "nx-project-config"; project: string; target: string }
    | { kind: "habitat-owned"; reason: string };
};
```

The exact shape may change, but the implementation must preserve:

- every reported target is resolved before emission;
- missing targets are absent and recorded as unavailable, not emitted;
- workspace/Habitat gates are separate from owner-project gates;
- evidence can be captured in tests without shelling out to real Nx for every
  unit case.

## Rule Scope Contract

Implementation must stop presenting owner-level rule aggregation as precise
path truth. It must report rule scope with at least:

- `exact-path`: rule scan roots or file-layer paths select the path;
- `project-owner`: rule owner project equals the classified project;
- `workspace-gate`: rule is a cross-repo Habitat gate;
- `unresolved-metadata`: current rule metadata is insufficient for path-scope
  precision.

Rules with unresolved scope may still appear if they are important for current
agent guidance, but their uncertainty must be explicit. They must not be
described as exact path obligations until Grit proof and manifest work supplies
scan-root metadata.

## Generator Support Contract

Project generator support requires:

- accepted kind;
- accepted root family for the kind;
- package name that matches workspace naming policy;
- `kind:*` tag matching the accepted kind;
- generated package shape that Nx discovers as a project;
- resolved `build`, `check`, and `test` target proof, or an accepted generated
  target matrix that states which targets are intentionally present;
- refusal before writes for unsupported kinds, non-empty roots, mismatched
  kind/root pairs, and package names that collide with existing projects.

Current supported kinds remain `plugin`, `foundation`, and `app`, but support is
not just the enum. Support means the generated output can be discovered and
verified through Nx and Habitat proof.

Non-uniform kinds remain domain-owned. This packet may define the refusal
contract and stale guidance repair, but it must not invent domain generators
for `mod`, `engine`, `control`, `adapter`, `sdk`, or `tooling`.

## Migration Capability Contract

The existing no-op migration proves that migration wiring can run. It does not
prove future harness convention migration capability. Future migration claims
require:

- a named convention change;
- source and target config shapes;
- dry-run or planned file operations;
- before/after proof in scratch workspace or fixture project;
- idempotence proof;
- records that distinguish migration wiring proof from convention migration
  proof.

## Official Documentation Constraints

Nx official docs support using resolved project and target metadata as the
source for target existence: `nx show project`, `nx show projects
--with-target`, and `nx show target` are documented command surfaces. Nx docs
also state inferred tasks come from plugins and tool config, and plugin order
can affect target output. Therefore Habitat must prove target existence from
resolved Nx metadata, not from `targetDefaults`, tags, folder names, or static
strings.

Nx generator docs support local generators, file creation, `--dry-run`, and
overwrite behavior. They support Habitat using Nx generators for supported
structure, but do not prove that any particular Habitat kind/root shape is
architecturally accepted.

Effect is not selected for pure classify metadata design when implementation
uses in-process structured Nx project metadata and typed local results.

Effect must be actively reconsidered when the implementation crosses any of
these structural boundaries:

- runtime `nx`, `bun`, `git`, Biome, or Grit command execution;
- multi-command proof orchestration where every proof needs argv, cwd, env,
  stdout, stderr, exit code, duration, and failure class;
- graph cache lifetime or scratch workspace lifecycle management;
- service substitution for tests across command runner, filesystem, Git,
  clock, reporter, or Nx metadata access;
- retry, timeout, bounded concurrency, collect-all, or fail-closed sequencing;
- enough hand-built tagged errors, cleanup scopes, provenance records, or
  dependency injection that local TypeScript would recreate Effect's native
  capabilities.

If those boundaries appear, the preferred design path is an explicit Effect
substrate slice unless local proof shows an equivalent typed architecture with
less risk and equal command provenance, service injection, cleanup, and
runtime-edge discipline. Rejection cannot rest on keeping the current manual
shape; it must prove that the replacement manual design eliminates the failure
classes this recovery is targeting.

If selected, Effect owns orchestration, typed failure channels, service
injection, runtime-edge discipline, resource scopes, and provenance. Nx remains
graph authority and Habitat remains authority for classification semantics,
generator support, baseline policy, and agent guidance.

## Write Set

Expected implementation write set:

- `tools/habitat-harness/src/lib/command-engine.ts`
- possible new `tools/habitat-harness/src/lib/nx-projects.ts`
- `tools/habitat-harness/src/commands/classify.ts`
- `tools/habitat-harness/src/generators/project/generator.cjs`
- `tools/habitat-harness/src/generators/project/schema.json`
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/migrations.json`
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- downstream OpenSpec records named in the realignment ledger

Protected paths:

- `tools/habitat-harness/src/generators/pattern/**` except guidance links to
  the pattern-generator metadata packet;
- `.grit/patterns/**`;
- baseline engine internals;
- hook implementation;
- Biome config;
- boundary taxonomy config unless a target proof requires a documented
  downstream record;
- product/runtime source;
- generated outputs.

## Test And Proof Design

### Unit Matrix

- project path classification uses resolved project metadata;
- workspace-level path classification emits only workspace/Habitat gates;
- literal diff classification preserves one row per changed path;
- project-local target list includes existing `check` and omits missing `test`;
- project-local target list includes `test` when Nx resolves it;
- workspace gate target list resolves every reported Habitat/Nx target;
- rule scope uses exact path, project-owner, workspace-gate, or
  unresolved-metadata status;
- generator refuses unsupported kinds before writes;
- generator refuses mismatched kind/root pairs before writes;
- generator refuses package-name collision before writes;
- generator scratch output is discoverable by Nx and reports expected targets;
- migration wiring proof cannot be used as convention migration proof.

### Command Proofs

Implementation must record exact command proof for:

- classify matrix over adapter, mod, foundation, app, tooling, plugin,
  generated-zone, missing-path, multi-path diff, and workspace-level paths;
- resolved `nx show project` target matrix for classified projects;
- `nx show target` proof for every emitted project-local target;
- `nx show projects --with-target` proof for target availability by project;
- generator dry-run file lists for supported kinds;
- scratch generation plus Nx discovery for supported kinds;
- refusal for unsupported kinds and mismatched kind/root pairs;
- README/AGENTS guidance scan proving stale instructions are gone.

Each command proof records cwd, argv, exit code, output class, current branch,
and non-claims.

## Downstream Proof Boundaries

- OpenSpec validation proves packet shape only.
- Nx resolved target output proves target existence, not architecture authority.
- Project generator dry-run proves planned file effects, not generated project
  correctness.
- Scratch generation plus Nx discovery proves project detectability and target
  presence, not product/runtime behavior.
- Rule-scope metadata remains weaker until Grit proof and Pattern Authority
  Manifest work supplies scan-root records.
- README/AGENTS updates prevent stale agent behavior but do not prove
  implementation.

## Review Lanes

- Product/outcome: does classify/generate become a trustworthy first action
  for agents?
- Nx graph/target: are target claims backed by resolved Nx metadata?
- Generator: are supported and refused generator surfaces precise and safe?
- Evidence/system: are proof classes separate and stale H8 claims corrected?
- Effect/substrate: does implementation need Effect because it grew command
  orchestration, provenance, scoped resource, retry/concurrency, or
  service-boundary complexity?
