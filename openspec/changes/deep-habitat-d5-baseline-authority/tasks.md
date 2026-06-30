# Tasks

## 1. Preconditions Before Source Implementation

- [x] 1.1 Read `$D5_SOURCE_PACKET`, `$D5_CHANGE/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md}`, `$D5_NEGATIVE_REVIEW`, and the accepted D0/D2 design/specification packets.
- [x] 1.2 Cite concrete D0 rows for every D5-touched durable-data, command, command-json, human-output, package-export, durable-schema, docs-example, and generated surface.
- [x] 1.3 Confirm live D2 implementation exposes the rule identity and baseline facet/projection D5 consumes.
- [x] 1.4 Keep source implementation blocked if any D0 row or required D2 projection is missing.
- [x] 1.5 Keep D7 enforcement pipeline redesign and D8 Pattern Governance lifecycle/admission implementation outside D5.

## 2. Characterization And Compatibility

- [x] 2.1 Characterize current baseline JSON file contract under `$HABITAT_TOOL/baselines/*.json`.
- [x] 2.2 Characterize current baseline-related `habitat check --json` fields/messages: `baselined`, `locked`, baseline contract diagnostics, and built-in `baseline-integrity` report.
- [x] 2.3 Characterize current `--expand-baseline` behavior, selector failures, refusal messages, and file-write timing.
- [x] 2.4 Characterize baseline package exports from `$HABITAT_TOOL/src/index.ts`.
- [x] 2.5 Characterize Pattern Authority manifest/generator baseline inputs as D8/D13 consumer surfaces, not D5 lifecycle ownership.
- [x] 2.6 Record whether D0 requires `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only` handling for each public/durable surface.

## 3. Target Baseline Authority State Model

- [x] 3.1 Define a closed `BaselineAuthorityState` union with accepted states `explicit-empty`, `explicit-debt`, `external-exception`, and refusal state `baseline-refusal`.
- [x] 3.2 Define `BaselineRefusal` reason values for every refusal in `specs/habitat-harness/spec.md`.
- [x] 3.3 Distinguish diagnostic keys, baseline entries, external exception projection entries, and baseline application matches in type names and tests.
- [x] 3.4 Preserve D0-recorded callable/export names through direct current contracts only; do not build the target model by extending broad optional historical shapes or compatibility adapters.
- [x] 3.5 Add exhaustive switch handling for every D5 state/result consumed by command code or downstream projections.

## 4. External Exception Source Projection

- [x] 4.1 Replace optional external source projection/validation combinations with a discriminated `ExternalExceptionSource` model.
- [x] 4.2 Define fixed projection and derived projection variants, each with source path, owner, migration owner, validation behavior, and sorted projected diagnostic keys.
- [x] 4.3 Refuse unreadable, malformed, unsorted, or otherwise invalid external projections without falling back to empty projection.
- [x] 4.4 Refuse external projection mismatch when parser-owned covered diagnostics do not exactly equal D5 projected keys.
- [x] 4.5 Refuse parser-owned covered diagnostics for explicit Habitat baseline states.

## 5. Shrink-Only Integrity And Expansion Guard

- [x] 5.1 Define `BaselineIntegrityResult` as accepted integrity or one or more baseline refusals.
- [x] 5.2 Define `BaselineExpansionDecision` as accepted introduced-rule baseline or refused baseline expansion; remove boolean/optional guard ambiguity from target code.
- [x] 5.3 Require comparison-base resolution before integrity or expansion acceptance.
- [x] 5.4 Refuse base rule registry missing/malformed and base baseline unreadable states explicitly.
- [x] 5.5 Refuse existing-rule baseline growth before writing files.
- [x] 5.6 Accept seeded baseline entries only when `RuleIntroductionBaselineManifest` exactly matches rule id, owner project, owner tool, baseline path, sorted initial diagnostic keys, and comparison base.
- [x] 5.7 Refuse missing or mismatched rule-introduction manifests.

## 6. Consumer Projections And Downstream Boundaries

- [x] 6.1 Define `BaselineApplicationResult` for D7 rule-report construction.
- [x] 6.2 Define `BaselineIntegrityResult` projection for the built-in baseline-integrity report.
- [x] 6.3 Define `BaselineAuthorityProjection` / baseline refusal result for D8 Pattern Governance consumption.
- [x] 6.4 Ensure D7 consumes D5 results but owns rule selection, rule execution, status derivation, `CheckReport`, and rendering.
- [x] 6.5 Ensure D8 consumes D5 results but owns Pattern Governance lifecycle/admission.
- [x] 6.6 Keep D13 generator/scaffolding changes outside D5 except D5 projection compatibility tests required by D8/D13 surfaces.

## 7. Validation

- [x] 7.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts`.
- [x] 7.2 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`.
- [x] 7.3 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-commands.test.ts`.
- [x] 7.4 Run `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts` for D5 projection consumer compatibility only.
- [x] 7.5 Run `bun run habitat check --json --base agent-DRA-d4-orientation-routing`
      and assert the built-in `baseline-integrity` report is present and
      passing; do not use the D0-refused `--rule baseline-integrity` selector.
- [x] 7.6 Run injected or fixture cases for explicit-empty, explicit-debt, missing, malformed, non-array, non-string, duplicate, unsorted, orphan, external-source unreadable/malformed, external projection mismatch, parser-owned bypass, comparison-base unavailable, base registry missing/malformed, base baseline unreadable, existing-rule growth, manifest missing, and manifest mismatch states.
- [x] 7.7 Run `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`.
- [x] 7.8 Run `bun run openspec:validate`.
- [x] 7.9 Run `git diff --check`.
- [x] 7.10 Run `git status --short --branch`.

## 8. Review And Realignment

- [ ] 8.1 Run fresh D5 domain/ontology, code/topology, TypeScript state-space, OpenSpec/testing, information-design, and cross-domino review lanes.
- [ ] 8.2 Import accepted P1/P2 findings into `$D5_REVIEW_LEDGER` and repair them before packet closure.
- [ ] 8.3 Run a D5 wording audit over active packet/control/final scratch for reduced-standard or ownership-leaking language.
- [ ] 8.4 Update `$D5_DOWNSTREAM_LEDGER` with exact D7/D8 facts, non-claims, and implementation blockers.
- [ ] 8.5 Update `$REMEDIATION_DIR/packet-index.md` only after D5 final review accepts the design/specification packet.
- [ ] 8.6 Leave the worktree clean and keep Graphite layers reviewable.
