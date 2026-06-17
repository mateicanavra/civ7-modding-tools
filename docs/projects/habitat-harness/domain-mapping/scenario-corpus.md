# Habitat Domain Mapping Scenario Corpus

This corpus is the scenario source for the Habitat domain design packet. It
uses current code as behavioral evidence and the reference docs as product
intent. It does not treat current module placement as the domain model.

## Coverage

- Supported current scenarios: S01-S09.
- Desired or future scenarios: S10-S12.
- Evidence basis: `tools/habitat-harness/docs/DOMAIN-MAPPING.md`,
  `CAPABILITIES.md`, `IMPLEMENTED-SURFACE.md`, `SCENARIOS.md`, `GAPS.md`,
  `AUTHORING-NEXT.md`, current Habitat source, and current Habitat tests.
- Product split: S01-S09 describe the current structural substrate; S10-S12
  describe the desired authoring layer that must not be assumed implemented.

## S01-classify-path

- Status: supported.
- Actor: coding agent or human maintainer.
- Trigger: before editing a repository path.
- Interface: `habitat classify <path>`.
- Input: repo path.
- Output: owning Nx project, tags, in-scope Habitat rules, required project and
  workspace targets, and unavailable target facts.
- Domain concepts: orientation, routing, project ownership, target truth,
  unavailable target.
- Authority: Orientation and routing, backed by Nx project metadata.
- Proof need: command output plus code/test trace.
- Failure/refusal modes: workspace-level path, unresolved rule metadata,
  missing project target.
- Current evidence: `classifyPath`/`classifyPathWithProjects` in
  `tools/habitat-harness/src/lib/command-engine.ts`,
  `NxProjectGraphMetadataReader` in `src/lib/nx-projects.ts`,
  `tools/habitat-harness/test/lib/classify.test.ts`,
  `CAPABILITIES.md`.
- Flow map: F01.
- Evidence status: verified current behavior.

## S02-classify-diff

- Status: supported.
- Actor: DRA owner or coding agent.
- Trigger: before handoff, review, or multi-file change planning.
- Interface: `habitat classify <diff>`.
- Input: diff text.
- Output: per-path classification using the same path classification contract.
- Domain concepts: diff routing, multi-path ownership, ownership ambiguity.
- Authority: Orientation and routing, backed by diff path extraction and Nx
  project metadata.
- Proof need: command output plus diff parser/code trace.
- Failure/refusal modes: malformed or pathless diff falls back to path
  classification rather than proving multi-path ownership.
- Current evidence: `classifyTarget`, `diffText`, and `extractDiffPaths` in
  `command-engine.ts`; `CAPABILITIES.md`.
- Flow map: F02.
- Evidence status: verified current behavior.

## S03-check-rules

- Status: supported.
- Actor: maintainer, CI, or agent.
- Trigger: structural enforcement gate.
- Interface: `habitat check` with optional owner/rule/tool/staged selectors.
- Input: rule, owner, tool, base, staged paths.
- Output: normalized check report, diagnostics, advisory/fail/pass status, and
  baseline-integrity report.
- Domain concepts: structural enforcement, rule selection, diagnostics,
  baseline, ratchet.
- Authority: Structural enforcement and Baseline authority.
- Proof need: report schema validation, selected rule execution, baseline
  files, and integrity checks.
- Failure/refusal modes: unknown selector, wrong selector namespace, empty
  selector intersection, unbaselined enforced finding, baseline contract
  failure.
- Current evidence: `selectRules`, `createCheckReport`, `executeSelectedRules`,
  `applyBaseline`, and `checkBaselineIntegrity` in `command-engine.ts` and
  `baseline.ts`; `tools/habitat-harness/src/rules/rules.json`; rule-selection
  and baseline tests; `CAPABILITIES.md`.
- Flow map: F03.
- Evidence status: verified current behavior.

## S04-verify-proof

- Status: supported.
- Actor: DRA owner, maintainer, or CI-like handoff process.
- Trigger: proof before handoff.
- Interface: `habitat verify`.
- Input: base ref and command args.
- Output: Habitat check summary, Nx affected execution or truthful skip,
  bounded streams, task cache facts, post-state facts, and explicit non-claims.
- Domain concepts: proof, affected graph, non-claim, handoff evidence.
- Authority: Proof contract authority, backed by Structural enforcement and
  Workspace graph integration.
- Proof need: JSON proof artifact and command behavior.
- Failure/refusal modes: Habitat check failure skips Nx affected; affected task
  failure produces nonzero proof; proof does not claim product runtime behavior.
- Current evidence: `createVerifyProof`, `runAffectedVerification`,
  `verifyAffectedTargets`, and `tools/habitat-harness/test/lib/verify-proof.test.ts`;
  `CAPABILITIES.md`.
- Flow map: F04.
- Evidence status: verified current behavior.

## S05-fix-approved-apply

- Status: supported limited.
- Actor: maintainer or coding agent.
- Trigger: approved structural repair exists for a recognized pattern.
- Interface: `habitat fix`.
- Input: clean worktree and allowlisted Grit apply pattern.
- Output: dry-run inventory or isolated-copy proof, approved changed paths,
  live apply when allowed, Biome handoff, rollback on failure, transaction proof.
- Domain concepts: guarded repair, transformation transaction, apply authority,
  rollback, non-claim.
- Authority: Transformation transaction, backed by Pattern governance for
  pattern approval and Biome for formatting handoff.
- Proof need: dry-run/apply/rollback evidence and changed-path approval.
- Failure/refusal modes: dirty tree, dry-run mismatch, unapproved path,
  unexpected file, missing target export, Biome failure, gate failure.
- Current evidence: `runFix` in `command-engine.ts`; `runGritApplyTransaction`,
  `classifyApplyRewriteInventory`, `classifyApplyDiffEvidence`, and rollback
  paths in `grit-apply.ts`; `tools/habitat-harness/test/lib/grit-apply.test.ts`;
  `CAPABILITIES.md`.
- Flow map: F05.
- Evidence status: verified current behavior.

## S06-run-hooks

- Status: supported local.
- Actor: Git hook invoked by local developer workflow.
- Trigger: pre-commit or pre-push.
- Interface: `habitat hook pre-commit` and `habitat hook pre-push`.
- Input: staged files, resources submodule state, push base.
- Output: local feedback, formatter restage, staged Grit/file-layer checks,
  pre-push Nx affected result, and local-proof notice.
- Domain concepts: local feedback, staged scope, partial staging refusal,
  generated-zone guard, resource state.
- Authority: Local feedback, with CI explicitly remaining authoritative.
- Proof need: hook trace and side-effect proof.
- Failure/refusal modes: dirty or uninitialized resources submodule, partial
  staging, formatter failure, Grit parse/finding, affected target failure.
- Current evidence: `runPreCommit`, `runPrePush`, `classifyResourcesState`,
  `localHookProofNotice` in `hooks.ts`; `tools/habitat-harness/test/lib/hooks.test.ts`;
  `CAPABILITIES.md`.
- Flow map: F06.
- Evidence status: verified current behavior.

## S07-generate-project

- Status: supported limited.
- Actor: agent or maintainer creating a uniform workspace project.
- Trigger: need for a supported app, foundation, or plugin project.
- Interface: `nx g @internal/habitat-harness:project`.
- Input: kind and name, with optional directory/package fields.
- Output: package, tsconfig, source, test, README, or refusal.
- Domain concepts: scaffolding, uniform project shape, domain-owned refusal.
- Authority: Scaffolding authority, bounded to uniform kinds only.
- Proof need: scratch generation and Nx/project metadata discovery.
- Failure/refusal modes: unsupported kind, mismatched root, mismatched package
  name, non-empty root, package-name collision.
- Current evidence: `tools/habitat-harness/src/generators/project/generator.cjs`,
  project generator tests, `IMPLEMENTED-SURFACE.md`, `CAPABILITIES.md`.
- Flow map: F07.
- Evidence status: verified current behavior.

## S08-draft-pattern

- Status: supported.
- Actor: maintainer or agent drafting a structural rule candidate.
- Trigger: need for a future structural check.
- Interface: `nx g @internal/habitat-harness:pattern`.
- Input: rule id, pattern name, lifecycle candidate, owner metadata.
- Output: non-enforcing candidate Grit markdown and candidate manifest.
- Domain concepts: pattern candidate, authority gap, admission checklist.
- Authority: Pattern governance.
- Proof need: generated candidate and manifest validation.
- Failure/refusal modes: active pattern collision, baseline collision, existing
  rule id, malformed rule id.
- Current evidence: `patternGenerator`, `candidateManifest`,
  `candidatePatternMarkdown` in `generators/pattern/generator.cjs`;
  pattern generator tests; Pattern Authority manifest schema.
- Flow map: F08.
- Evidence status: verified current behavior.

## S09-promote-pattern

- Status: supported constrained.
- Actor: DRA owner or accepted pattern maintainer.
- Trigger: accepted Pattern Authority source is ready for registration.
- Interface: pattern generator registered-advisory or registered-enforced
  lifecycle.
- Input: accepted manifest, baseline contract, rule introduction manifest, hook
  scope decision, scan roots and proving sources.
- Output: registered active Grit pattern and new rule registry entry.
- Domain concepts: admission, promotion, enforcement lane, baseline contract,
  hook-scope decision.
- Authority: Pattern governance, Structural enforcement, Baseline authority.
- Proof need: manifest validation, baseline contract proof, rule registry proof.
- Failure/refusal modes: missing manifest, rejected manifest, missing baseline,
  baseline mismatch, active artifact collision, unaccepted candidate.
- Current evidence: `registeredPatternPromotionProgram`,
  `validateRegisteredBaselineContract`, `registeredRuleEntry` in
  `generators/pattern/registration.cjs`; Pattern Authority manifest schema and
  tests.
- Flow map: F09.
- Evidence status: verified current behavior.

## S10-generate-mapgen-authoring

- Status: desired gap.
- Actor: agent authoring MapGen structure.
- Trigger: need for a new MapGen domain, op, stage, step, or recipe wiring.
- Interface: future Habitat authoring generator or workflow.
- Input: topology request and product/domain intent.
- Output: generated topology plus proof loop, if designed later.
- Domain concepts: authoring topology, recipe wiring, product-owned generator,
  substrate-versus-authoring split.
- Authority: future Authoring topology context and MapGen product owners.
- Proof need: generator proof, classify, checks, recipe compile, and product
  acceptance loop.
- Failure/refusal modes: unsupported today; current project generator refuses
  mod/engine/control/adapter/sdk/tooling shapes and cannot generate MapGen
  domains or recipes.
- Current evidence: `AUTHORING-NEXT.md`, `GAPS.md`, `DOMAIN-MAPPING.md`,
  project generator refusal message.
- Flow map: F10.
- Evidence status: hypothesis for target behavior; verified current gap.

## S11-describe-human-pattern

- Status: desired gap.
- Actor: human maintainer.
- Trigger: recurring structural idea needs to become usable by agents.
- Interface: future pattern authoring workflow.
- Input: human description, examples, accepted sources, fixture corpus,
  transform safety needs.
- Output: admitted check/apply/generator path with explicit proof class.
- Domain concepts: human pattern description, executable policy, admission,
  transform safety.
- Authority: future Pattern governance extension, not raw Grit prose.
- Proof need: example corpus, source authority, fixtures, false-positive model,
  apply-safety disposition.
- Failure/refusal modes: ambiguous authority, missing examples, unsafe
  transformation, pattern metadata masquerading as domain authority.
- Current evidence: Pattern Authority manifest schema, `AUTHORING-NEXT.md`,
  `DOMAIN-MAPPING.md`.
- Flow map: F11.
- Evidence status: hypothesis.

## S12-maintain-repo-with-habitat

- Status: desired.
- Actor: human maintainer and coding agents.
- Trigger: ongoing repository maintenance and structural change.
- Interface: combined Habitat workflow: classify, check, verify, hook, fix,
  generators, and future authoring.
- Input: paths, diffs, rules, staged changes, pattern descriptions, topology
  requests.
- Output: lower ambiguity, routed proof, supported refusals, and maintainable
  structural changes.
- Domain concepts: structural operating surface, ambiguity reduction, proof
  ladder, repository maintenance.
- Authority: Habitat domain as designed, with distinct authorities for routing,
  enforcement, proof, pattern governance, transformation, local feedback, and
  authoring topology.
- Proof need: scenario chain proof and reviewed domain design packet.
- Failure/refusal modes: overbroad claims, hidden proof classes, confusing
  substrate capability with authoring capability.
- Current evidence: all reference docs, S01-S11, and this design packet.
- Flow map: F12.
- Evidence status: corroborated target outcome.
