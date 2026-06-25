# Deep Habitat OpenSpec Remediation Validation Expectations

Role: Testing/Validation Designer.

Scope: validation expectations for the Phase 2 packet suite in
`docs/projects/habitat-harness/phase2-workstream-packets/`. This is a scratch
artifact for OpenSpec remediation. It does not authorize implementation and does
not claim that any command below has passed in this branch.

Repo root for command strings:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`

## Shared Validation Rules

Every OpenSpec change derived from a packet needs four kinds of evidence:

1. Unit or contract tests for the packet's owned state machine.
2. Integration or CLI command proof for the user scenario.
3. One injected bad case that would have passed under the old ambiguous model.
4. Explicit non-claims so weaker evidence cannot be read as stronger evidence.

Every implementation packet must record these commands from the repo root:

```sh
git status --short --branch
git diff --check
bun run openspec:validate
```

Expected status is `0` for all three at closure. `git status --short --branch`
may show intentional tracked packet changes before commit, but closure must
state whether the worktree is clean, committed, or deliberately handed off.
`bun run openspec:validate` proves only OpenSpec artifact shape. It does not
prove source behavior, generated output, hook behavior, runtime behavior, or
Graphite submission.

Cache stance:

- Unit tests run through `bun run --cwd tools/habitat test -- ...` are
  normal Vitest execution and should be treated as fresh local proof.
- Git-state, staged-file, dry-run hook, dry-run apply, injected probe, and
  generator dry-run commands must run fresh because they depend on current
  worktree state.
- Nx commands may use cache only when the validation record captures the exact
  target output or dependency evidence used. Cache-backed Nx success is not
  enough for a freshness claim when the packet is about command provenance,
  graph truth, target alias execution, generated-zone freshness, or hooks.

## Per-Domino Gates

### D0 Scenario/Public Contract Inventory

Correctness means agents can tell which CLI verbs, JSON fields, package exports,
Nx targets, generators, hooks, and root scripts are stable, versioned, internal,
deprecated, generated, command-only, or refused before internals move.
Operationally, no later packet may use an unclassified surface as either public
or internal.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts`
  must exit `0` and assert stable CLI invocation behavior, including direct
  `--json` behavior.
- Integration:
  `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js`
  must exit `0` and return a representative workspace classification.
- Hygiene:
  `bun run lint` must exit `0`; Nx cache is acceptable only if the validation
  record captures matching inputs.
- Injected bad case: an unsupported or ambiguous command shape, including the
  known root-script forwarding ambiguity, must fail or be classified with a
  named product reason instead of being documented as a typo.
- Non-claims: D0 does not prove command correctness, structural cleanliness, or
  any internal extraction. It proves only the compatibility inventory that later
  changes must preserve, version, or refuse.

### D1 Proof Contract Boundary

Correctness means Habitat proof DTOs say what was checked, observed, skipped,
refused, and not claimed without allowing command proof, hook feedback, apply
proof, Graphite state, or runtime proof to substitute for each other.
Operationally, impossible proof combinations must be unrepresentable or rejected.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts`
  must exit `0` and assert proof class, scope, non-claims, failure/refusal, and
  stream-bounding semantics.
- CLI:
  `bun run habitat check --json` must exit `0` only when current-tree check
  risks are fixed. If current-tree risks remain, the packet must record the
  nonzero result as an unresolved behavior risk, not proof-contract closure.
- Injected bad case: a malformed proof payload and a failed delegated command
  must not be representable as a passing proof.
- Cache stance: schema tests are fresh local proof. CLI proof must record
  whether any delegated Nx or wrapper work was cached.
- Non-claims: D1 does not prove rule execution, current-tree cleanliness, or
  apply safety.

### D2 Rule Registry Metadata Contract

Correctness means rule metadata exposes typed facets for identity, selector,
scope, graph, baseline, Grit, generated-zone, and governance consumers without
forcing consumers to parse prose or whole registry rows. Operationally, missing
required facet data must fail before rule execution.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/rule-selection.test.ts test/rules/pattern-authority-manifest.test.ts`
  must exit `0` and assert selector, manifest, and projection contracts.
- CLI:
  `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/rules/rules.json`
  must exit `0` and preserve registry ownership discovery.
- Graph:
  `nx show project @habitat/cli` must exit `0` and record the
  relevant target metadata.
- Injected bad case: one rule row missing owner, tool, or lane metadata must be
  rejected before a command can silently skip or misroute it.
- Cache stance: graph metadata may be cached only if the validation record
  includes the target metadata used.
- Non-claims: D2 does not execute rules, prove target success, admit patterns,
  or change baseline debt.

### D3 Workspace Graph Integration Boundary

Correctness means classify, verify, root scripts, and inferred targets consume
one graph boundary for project ownership, target availability, alias targets,
and graph errors. Operationally, an unavailable or broken target alias cannot be
reported as executable proof.

Validation gates:

- Graph:
  `nx show project @habitat/cli` must exit `0` and expose Habitat
  project metadata.
- Alias execution:
  `nx run @habitat/cli:habitat:rule:biome-ci` may be closure proof
  only if it exits `0` and the record proves the dependency target ran rather
  than a false-green `node -e ""` path.
- Boundary:
  `nx run @habitat/cli:boundaries` must exit `0` only after current
  graph-file ENOENT risks are fixed or explicitly excluded from the closure
  claim.
- Unit tests must include plugin inferred-target tests and classify tests for
  available and unavailable targets.
- Injected bad case: one intentionally broken target alias must be shown unable
  to pass as an executable target.
- Cache stance: target-alias proof must run with cache disabled or include
  dependency execution evidence.
- Non-claims: graph metadata does not execute targets, and a valid target fact
  does not prove target success.

### D4 Orientation and Routing

Correctness means `habitat classify` returns explicit path, diff, malformed
diff, unresolved owner, workspace fallback, and graph-error states with owner,
rule, target, unavailable target, unresolved fact, and non-claim fields.
Operationally, classify orients before editing but never proves targets or rule
semantics.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/classify.test.ts` must
  exit `0` and cover every classification variant plus refusal output.
- CLI path:
  `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/plugin.js`
  must exit `0`.
- CLI docs path:
  `bun run habitat classify docs/projects/habitat-harness/phase2-workstream-packets/README.md`
  must exit `0`.
- Injected bad case: one unsupported path or malformed/pathless diff must refuse
  with a stable reason and next safe action.
- Cache stance: classify command proof must be current process output. It may
  display graph metadata, but the command result itself cannot be replaced by
  cached Nx metadata.
- Non-claims: classify does not run targets, prove rules, prove apply safety, or
  prove generated-zone freshness.

### D5 Baseline Authority

Correctness means baseline debt is represented as explicit empty, explicit debt,
external exception, malformed, missing, orphaned, introduced-rule expansion, or
shrink-only failure states. Operationally, no rule can grow baseline debt unless
the rule introduction path proves that expansion is intentional.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/baseline.test.ts` must
  exit `0` and assert baseline state and expansion guard semantics.
- CLI:
  `bun run habitat check --rule baseline-integrity --json` must exit `0` for
  current-tree baseline integrity at closure.
- Git:
  `git status --short --branch` must show only intentional tracked baseline or
  packet changes before commit, and a clean or handed-off state at closure.
- Injected bad case: missing, malformed, orphaned, and expanded baseline rows
  must be rejected unless the rule itself is new and has introduction evidence.
- Cache stance: baseline tests are fresh local proof. The command proof must
  record whether any wrapped target cache was involved.
- Non-claims: D5 does not execute Grit, prove all structural checks pass, admit
  new rules, or prove diagnostic correctness.

### D6 Diagnostic Pattern Catalog

Correctness means Grit diagnostic acquisition, scan-root validation, adapter
failure projection, current-tree diagnostic projection, and injected probe proof
are separate from pattern admission and apply safety. Operationally, native
Grit behavior, Habitat wrapper behavior, current-tree proof, and injected
violation proof must be recorded as different rows.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts`
  must exit `0`.
- CLI:
  `bun run habitat check --tool grit-check --json` must exit `0` only after
  current `GritMalformedJson` projection risk is fixed. Otherwise it must be
  recorded as unresolved current behavior, not D6 closure.
- Cleanup:
  `git status --short --branch` must confirm injected probe cleanup leaves no
  source-tree residue.
- Injected bad case: one scoped probe should match exactly one expected row, and
  one malformed wrapper output must project as adapter failure rather than a
  generic command crash.
- Cache stance: injected probes must run fresh. Native Grit sample proof may
  mention tool cache only if exact pattern provenance is recorded.
- Non-claims: D6 does not admit patterns, prove apply safety, or prove full
  current-tree structural cleanliness.

### D7 Structural Enforcement Pipeline

Correctness means `habitat check` has explicit stages for selector parsing, rule
selection, rule execution, diagnostic normalization, baseline application,
report construction, and rendering. Operationally, `CheckReport.ok` must be
derived from rule reports and cannot contradict individual statuses.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts test/lib/enforcement-surface.test.ts test/lib/rule-selection.test.ts`
  must exit `0`.
- CLI full check:
  `bun run habitat check --json` must exit `0` only after current-tree proof
  risks are fixed or explicitly excluded from the closure claim.
- CLI single rule:
  `bun run habitat check --rule workspace-entrypoints --json` must exit `0`.
- Injected bad case: invalid selector JSON and a staged generated-zone violation
  from D10 must not be reported as baseline-only proof or a successful check.
- Cache stance: command proof must record whether wrapped Nx targets were cached
  and whether current-tree checks ran fresh.
- Non-claims: D7 does not own baselines, diagnostics, generated-zone policy,
  affected Nx targets, runtime/product behavior, or apply safety.

### D8 Pattern Governance

Correctness means candidate, manifest-invalid, registered diagnostic,
registered hook-scoped, registered apply-approved, refused, and retired pattern
states are distinct. Operationally, candidate generation cannot imply rule
registration, and diagnostic registration cannot imply apply approval.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`
  must exit `0`.
- Baseline consumer:
  `bun run habitat check --rule baseline-integrity --json` must exit `0`.
- Git:
  `git status --short --branch` must show candidate generation and manifest
  changes are intentional tracked changes only.
- Injected bad case: a candidate without accepted manifest, fixture proof, or
  hook-scope decision must be unable to become registered.
- Cache stance: generator and manifest tests run fresh. Baseline command output
  must be recorded if used as admission evidence.
- Non-claims: D8 does not own Grit acquisition, apply transactions, current-tree
  wrapper behavior, or baseline state-machine implementation.

### G-HOST Host Policy Boundary Gate

Correctness means generic Habitat consumes host declarations for generated
zones, protected paths, host-specific apply gates, unsupported host shapes, and
future topology triggers without baking Civ7 or MapGen policy into generic code.
Operationally, missing host policy must refuse instead of silently disabling a
guard or treating host paths as built-in truth.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/generated-zones.test.ts test/lib/grit-apply.test.ts`
  must exit `0` after host-policy fixtures are introduced or updated.
- CLI representative path:
  `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`
  must exit `0`.
- Git:
  `git status --short --branch` must prove declarations are tracked data rather
  than hidden generated state.
- Injected bad case: one unregistered host policy must refuse before generic
  Habitat interprets it as built-in truth.
- Cache stance: declaration and refusal tests must run fresh.
- Non-claims: G-HOST does not prove generated files are current, MapGen runtime
  behavior, product behavior, or Authoring Topology.

### D9 Transformation Transaction

Correctness means `habitat fix` applies only approved patterns through dry-run
inventory, isolated-copy proof, path approval, rollback, formatter handoff, and
declared host gates. Operationally, live apply without approved pattern,
unapproved paths, dirty worktree, formatter failure, gate failure, and rollback
failure must be separate states.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/grit-apply.test.ts`
  must exit `0` and cover dry-run, isolated copy, rollback, formatter handoff,
  and safe-write states.
- CLI:
  `bun run habitat fix --dry-run --json` must exit `0` after approved apply
  patterns have stable dry-run inventory output.
- Git:
  `git status --short --branch` must exit `0` before and after dry-run; write
  mode fixture proof may alter only expected fixture files.
- Injected bad case: one apply pattern that writes outside approved roots and
  one generated-zone write blocked by D10 must fail before live apply.
- Cache stance: dry-run and isolated-copy proof must run fresh, not from Nx
  cache.
- Non-claims: D9 does not admit apply patterns, prove host semantics, prove
  current-tree cleanliness, or prove runtime/product behavior.

### D10 Generated/Protected Zone Authority

Correctness means generated and protected zones are declared by host policy and
enforced by generic staged mutation guards with owner and next safe action.
Operationally, clean staged state must pass, but a staged generated/protected
hand edit must fail with the owning remediation.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/generated-zones.test.ts test/lib/hooks.test.ts`
  must exit `0` after generated-zone fixtures are introduced or updated.
- Freshness:
  `nx run @habitat/cli:generated:check` must exit `0` and record
  whether dependency targets were cached.
- CLI staged guard:
  `bun run habitat check --staged --tool file-layer --json` must exit `0` for a
  clean staged state and nonzero for the injected protected-zone mutation.
- Injected bad case: stage one protected generated file mutation and prove it is
  refused with owner and remediation.
- Cache stance: staged file-layer proof must run fresh. Generated-check may use
  Nx cache only with dependency target evidence.
- Non-claims: D10 does not define host policy, regenerate files, prove generated
  files are current beyond the named check, or prove runtime/product behavior.

### D11 Local Feedback

Correctness means hooks orchestrate local feedback from published contracts
without becoming proof authority. Operationally, hook trace states must derive
allowed/refused commit behavior from staged paths, resource state, checks, Grit,
generated-zone guards, affected targets, and Graphite base resolution.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/hooks.test.ts` must exit
  `0`.
- CLI pre-commit:
  `bun run habitat hook pre-commit --dry-run` must exit `0` for clean staged
  state after D7, D9, and D10 contracts are stable.
- CLI pre-push:
  `bun run habitat hook pre-push --dry-run` must exit `0` and record Graphite
  base detection.
- Injected bad case: staged generated-zone mutation and a failing wrapped check
  must be reported as local feedback failures without claiming CI or review
  proof.
- Cache stance: hook dry-runs must run fresh because they depend on current Git
  and staged state.
- Non-claims: hook pass is not CI, review proof, runtime/product proof, full
  apply safety proof, or a replacement for `habitat verify`.

### D12 Proof/Handoff Verify Command

Correctness means `habitat verify` assembles handoff proof by consuming check
and graph contracts, selecting an affected base, bounding command streams,
recording cache/skipped/failed states, and capturing post-state. Operationally,
affected Nx proof must not run after failed Habitat check unless a future public
contract explicitly allows forced mode.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/verify-proof.test.ts test/lib/proof-artifact.test.ts`
  must exit `0`.
- CLI:
  `bun run habitat verify --json` must exit `0` only after D7 current-tree proof
  and D3 graph metadata are stable.
- Git:
  `git status --short --branch` must exit `0`; verify must not mutate the
  worktree except explicit proof-output paths.
- Injected bad case: one failing delegated command must produce a failing proof
  with bounded stdout/stderr and a skipped or failed affected state as
  appropriate.
- Cache stance: verify must record each delegated command as cached, fresh,
  skipped, failed, or non-claimed.
- Non-claims: verify is not CI, runtime/product proof, Graphite submit/PR proof,
  hook proof, or apply safety proof.

### D13 Scaffolding and Refusal Contracts

Correctness means Habitat scaffolds only supported generic project kinds and
candidate patterns, while unsupported kinds, host-specific authoring, and
Authoring Topology requests refuse with reason, owner, next safe action,
proof class, and non-claims. Operationally, unsupported requests must fail
before writes.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts`
  must exit `0`.
- Supported dry-run:
  `nx g @habitat/cli:project habitat-scratch --kind=plugin --dry-run`
  must exit `0`.
- Unsupported dry-run:
  `nx g @habitat/cli:project unsupported-scratch --kind=host-specific --dry-run`
  must exit nonzero with a designed refusal.
- Injected bad case: unsupported kind, registered-pattern-without-manifest, and
  host-specific scaffold request must all refuse before writes.
- Cache stance: generator dry-runs must run fresh and cannot rely on Nx cache.
- Non-claims: D13 does not implement unsupported project kinds, register
  patterns, implement Authoring Topology, or prove app/product behavior.

### D14 Authoring Topology Fence

Correctness means MapGen domain/op/stage/step/recipe generation is a future
product boundary, not Phase 3 structural substrate work. Operationally, requests
for domain-specific authoring topology must route through D13 refusal or future
investigation criteria, not generic scaffolding.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/generators/project-generator.test.ts test/lib/classify.test.ts`
  must exit `0` and cover refusal plus orientation examples.
- CLI:
  `bun run habitat classify docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`
  must exit `0` for future-trigger record orientation.
- Git:
  `git status --short --branch` must show only docs or explicit OpenSpec change
  records for this fence.
- Injected bad case: a MapGen Authoring Topology implementation request must
  return a future-work boundary, not a scaffold.
- Cache stance: refusal tests must run fresh.
- Non-claims: D14 does not implement Authoring Topology, create generators, or
  prove MapGen product behavior.

### D15 Execution Provenance Substrate Trigger

Correctness means a typed command provenance substrate is introduced only when a
consuming packet proves local DTOs cannot represent required command provenance
without contradictory states. Operationally, D15 is a trigger checklist, not a
standalone Effect or process-framework migration.

Validation gates:

- Unit/contract:
  `bun run --cwd tools/habitat test -- test/lib/habitat-process.test.ts test/lib/effect-parity.test.ts`
  must exit `0` only if a consuming packet activates D15.
- Git:
  `git status --short --branch` must exit `0`; provenance capture must not
  create hidden output files.
- Trigger commands, owned by the consuming packet:
  `bun run habitat check --tool grit-check --json` follows D6 status and must
  record argv, cwd, env subset, duration, stdout/stderr bounds,
  cache/freshness, and git state when used as a D15 trigger.
  `bun run habitat check --json` follows D7 status and must record delegated
  command provenance per rule/tool segment when used as a D15 trigger.
  `bun run habitat fix --dry-run --json` follows D9 status and must record
  isolated-copy path, approved write roots, formatter handoff, and git state
  when used as a D15 trigger.
  `bun run habitat hook pre-commit --dry-run` follows D11 status and must record
  staged paths, Graphite base, and local-only non-claim when used as a D15
  trigger.
- Injected bad case: missing binary, nonzero command, and oversized output must
  preserve typed failure state without collapsing into a generic thrown error.
- Cache stance: process/provenance tests run fresh. Delegated command cache use
  must be captured rather than hidden.
- Non-claims: D15 does not authorize broad substrate migration, improve product
  behavior by itself, or replace proof-class labels.

## Adequacy Check

The remediation pass is validation-ready when each packet's OpenSpec change can
answer these questions without reading implementation code:

- What user or operator scenario is being protected?
- What impossible or ambiguous state is removed?
- Which unit tests prove the owned state machine?
- Which CLI or integration command proves the user-visible behavior?
- Which injected bad case would catch a false green?
- Which evidence may be cached, and what must be fresh?
- What does the packet explicitly not prove?

If a packet cannot answer one of these, its validation section is not ready for
Phase 3 implementation.

Skills used: domain-design, information-design, testing-design, civ7-open-spec-workstream, civ7-systematic-workstream, solution-design, system-design.
