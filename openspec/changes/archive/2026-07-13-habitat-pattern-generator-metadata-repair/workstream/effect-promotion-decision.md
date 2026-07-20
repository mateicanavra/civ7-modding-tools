# Registered Promotion Effect Decision

**Change:** `habitat-pattern-generator-metadata-repair`
**Checkpoint branch:** `agent-HR-habitat-pattern-authority-effect-decision`
**Date:** 2026-06-15
**Status:** supervisor-accepted substrate decision; no registered writes
implemented in this checkpoint

## Accepted Decision

Registered Pattern Authority promotion should use the accepted Habitat Effect
substrate for command/file proof orchestration when it crosses from pure
manifest validation into registered advisory or registered enforced writes.

This records the adoption decision for the future promotion implementation
boundary. It is not an implementation of registered generation. This checkpoint
does not write active Grit patterns, `rules.json` entries, baseline files, hook
scope, or current-tree proof artifacts.

Candidate generation and pure manifest validation remain plain TypeScript/Nx
generator and in-memory validation paths because they do not execute commands,
mutate active rule-pack state, allocate scratch workspaces, consume baseline
manifests, or perform hook-scope proof.

## Evidence

- `docs/projects/habitat-harness/effect-orchestration-evaluation.md` selects
  Effect for Habitat's Grit adapter substrate and keeps oclif as the command
  shell. That downstack substrate is now present in this branch through
  `tools/habitat-harness/src/lib/effect-runtime.ts`,
  `tools/habitat-harness/src/lib/habitat-process.ts`, and
  `tools/habitat-harness/src/lib/proof-artifact.ts`.
- `docs/projects/habitat-harness/research/official-docs-effect.md` records the
  official-doc evidence used by this packet: typed success/error/requirements,
  runtime-edge discipline, Layers/services, scoped acquisition/release,
  platform `Command` argv/env/cwd/stdout/stderr/exit-code behavior, bounded
  concurrency/collection choices, TestClock seams, and tagged errors.
- Fresh official-doc spot check on 2026-06-15:
  `https://effect.website/docs/resource-management/scope/` describes scoped
  resource lifetime and finalizers, and
  `https://effect-ts.github.io/effect/effect/Layer.ts.html` describes Layers as
  service recipes with scoped resource construction. These match the local
  evidence pack and do not change the local decision.
- `tools/habitat-harness/package.json` already carries the accepted Habitat
  Effect/Grit-adapter dependency set from the downstack substrate:
  `effect@3.21.3`, `@effect/platform@0.96.1`, and
  `@effect/platform-node@0.107.0`.
- `tools/habitat-harness/test/lib/effect-parity.test.ts` proves the existing
  substrate's command execution, scoped cleanup, tagged error handling, fake
  service provision, and runtime-edge guard. The future registered-promotion
  implementation must add its own focused tests; this parity test is substrate
  evidence only.

## Service Boundary For Future Promotion

The future registered-promotion implementation must consume or introduce Effect
services at the orchestration boundary, preserving the existing
`runHabitatEffect(...)` runtime edge:

- `PatternManifestStore`: read, validate, and plan writes for Pattern Authority
  Manifest source artifacts.
- `RulePackStore`: read, validate, and plan `rules.json` manifest references and
  registered rule entries.
- `BaselineIntroductionStore`: consume the accepted scaffold/baseline
  rule-introduction contract without duplicating baseline policy.
- `HabitatProcess` / command runner: run Grit, Nx, Biome, Git, and package
  commands with argv, cwd, env delta, stdout, stderr, exit code, duration,
  failure tag, and non-claim provenance.
- `RepoFileSystem`: own planned source writes, scratch paths, no-write proof,
  cleanup, and residue checks.
- `ProofArtifactWriter` / reporter: write durable proof summaries only when the
  active packet explicitly accepts a committed proof artifact path.
- `Clock`: make timing and retry/backoff proof deterministic when promotion adds
  waiting, polling, or bounded concurrency.

## Required Failure Classes

Registered promotion must fail closed with typed/tagged failures before writes
for at least:

- missing, malformed, placeholder, contradicted, or orphan Pattern Authority
  Manifest;
- missing or mismatched rule-pack manifest reference when rule-pack context is
  required;
- duplicate `ruleId` or `patternName`;
- missing, malformed, placeholder, or blocking baseline-introduction manifest;
- current-tree scan result that blocks registration;
- missing native Grit fixture proof for registered generated samples;
- hook-scope request without registered-enforced lifecycle and accepted
  staged-scope/cost/parser/baseline/false-positive proof;
- command unavailable, command nonzero, malformed command output, interrupted
  command, and unsupported output schema;
- no-write proof mismatch, unexpected file writes, failed cleanup, and residue
  after scoped scratch work.

## P3 Watch Item

When registered rule-pack context is implemented, the promotion path must call
`validatePatternAuthorityManifest(...)` with `requireRuleReference: true` and a
matching rule reference for registered advisory/enforced manifests. An isolated
registered manifest is not sufficient rule-pack authority.

## Non-Claims

- No registered advisory or registered enforced generation is implemented.
- No active `.grit` check/apply pattern is generated or modified.
- No `rules.json` manifest reference or rule entry is added.
- No baseline manifest is consumed and no baseline is created, expanded, or
  shrunk.
- No native Grit sample, current-tree scan, injected proof, hook-scope proof,
  or product/runtime proof is claimed.
- No HG row-owned artifact is consumed as proof.
