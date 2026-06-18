# D8 Final TypeScript / Validation Rereview

Status: ACCEPTED FOR DESIGN/SPECIFICATION ONLY

No unresolved P1/P2 TypeScript state-space or validation blockers remain in the repaired D8 Pattern Governance packet. This acceptance is limited to the OpenSpec design/specification contract. It does not approve source implementation, does not mark D8 implementation-complete, and does not override the packet's source blockers for D0/D1/D2/D5/D6/D7/D10/G-HOST/D9/D13 inputs.

## Review Scope

Reviewed as a design/specification rereview only:

- `openspec/changes/deep-habitat-d8-pattern-governance/**`
- D8 first-wave scratch records under `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-*.md`
- Current Pattern Authority source and tests:
  - `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat-harness/src/generators/pattern/generator.cjs`
  - `tools/habitat-harness/src/generators/pattern/registration.cjs`
  - `tools/habitat-harness/src/generators/pattern/schema.json`
  - `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
  - `tools/habitat-harness/test/generators/pattern-generator.test.ts`

Skill anchors read in full before review:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- Every TypeScript refactoring reference and asset under that skill's `references/` and `assets/`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`

## Findings

No P1/P2 findings.

The first-wave TypeScript/validation blockers are repaired in the current packet:

- State-space collapse is specified. `design.md:168-198` defines a closed `PatternAuthorityState` with candidate, review, invalid, diagnostic, local-feedback, apply, refused, and retired variants, and requires internal replacement of `authorityAccepted: boolean` with state narrowing. `tasks.md:38-52` turns that into implementation slices and preserves existing JSON/CLI behavior as compatibility projection only.
- Diagnostic, local-feedback, and apply states are separated. `design.md:83-98` defines the target state families and explicitly states that admission is D8 vocabulary while registration is D2 vocabulary. `spec.md:178-228` falsifies diagnostic-to-apply conflation and D9 write-authority leakage.
- Consumer projections are specified. `design.md:125-136` publishes `PatternAuthorityProjection`, `DiagnosticAdmissionProjection`, `LocalFeedbackAdmissionProjection`, `ApplyAdmissionProjection`, `CandidateHandoffProjection`, and `PatternRecoveryProjection`, and states that consumers receive projections rather than whole manifests. `tasks.md:89-99` requires projection builders and tests for D9, D13, diagnostic/apply separation, and retired-state rejection.
- Write and protected sets are specified. `design.md:200-249` names the later implementation write set, runtime write projections, and protected paths. This directly repairs the prior implicit-write-set blocker and prevents implementation agents from editing baselines, apply patterns, Grit config, hook/command/apply/baseline libraries, product roots, generated artifacts, lockfiles, and vendor caches without owner authorization.
- Safe refactor moves are specified. `design.md:185-198` requires lifecycle constructors first, compatibility-preserving manifest shape, replacement of `authorityAccepted`, typed admission results, projection builders, and diagnostic/apply separation. `tasks.md:25-99` sequences characterization, state model, candidate/manifest admission, diagnostic/local-feedback admission, apply handoff, and projection tests before closure.
- Validation gates are now falsifiable. `design.md:251-279` separates design-time gates from later implementation gates, and `tasks.md:101-117` names exact validation commands. Later implementation gates include type-state/projection tests, diagnostic-without-apply tests, projection-only consumer tests, D5 baseline-integrity, native Grit sample tests for touched pattern files, classify observations with non-claims, and Graphite/worktree hygiene.
- Implementation-time state-model decisions are blocked. `proposal.md:116-131` lists stop conditions for file-presence admission, registry/Grit/baseline/generator-option inference, diagnostic-to-apply conflation, hook-lane inference, whole-row/raw-file/raw-Grit reads, error-string authority, and legacy active rules without `manifestPath`. `review-disposition-ledger.md:10-27` imports the earlier P1/P2 findings and records repair evidence pending final rereview.

## Current Source Cross-Check

The current source still has the expected compatibility shape: `PatternAuthorityLifecycle` is `candidate | registered-advisory | registered-enforced`, `PatternAuthorityValidationResult` exposes `authorityAccepted`, generator promotion branches on string lifecycle, and registration writes active Grit check patterns plus `rules.json` after runtime checks. Those are implementation evidence and migration inputs, not acceptance blockers for this design/specification rereview, because the repaired packet explicitly classifies them as compatibility/present-state facts and specifies the target state collapse before source work.

## Validation Run

- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`: passed.
- `bun run openspec:validate`: passed, 249 items passed and 0 failed.
- `git diff --check`: passed.
- Complete-standard wording audit grep was run over `$D8_CHANGE/**` and D8 scratch. Hits were historical first-wave findings, forbidden-language audit text, or active control/status language such as "pending final rereview" and "not implementation-complete"; I found no active TypeScript/validation reduced-standard guidance that changes this status.

## P3 Suggestions

- The final closure pass should keep the wording-audit disposition explicit, because the broad grep intentionally matches historical D8 scratch and active control rows. The useful closure evidence is not "no hits"; it is "no active reduced-standard guidance after classifying historical and forbidden-language-list hits."
- When implementation begins, keep the first source slice narrow: add the D8 state/projection model and compatibility projections before changing generator behavior or public manifest/schema surfaces. That preserves the packet's state-collapse order and keeps D0/D1 compatibility blockers visible.

Skills used: domain-design, information-design, typescript-refactoring, testing-design.
