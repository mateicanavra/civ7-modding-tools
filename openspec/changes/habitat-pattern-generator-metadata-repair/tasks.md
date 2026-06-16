## 1. Design And Review Gate

- [x] 1.1 Open this packet with proposal, design, spec delta, tasks, phase
  record, source synthesis, review ledger, and downstream realignment ledger.
- [x] 1.2 Run product/outcome, evidence/system, generator/Nx, and Grit consumer
  review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`.

## 2. Source Refresh And Current Evidence

- [x] 2.1 Re-read the takeover frame, recovery claim row
  `CLAIM-P1-PATTERN-GENERATOR`, Grit corpus ledger, H8 generator records,
  Grit proof repair, and scaffold/baseline contract repair.
- [x] 2.2 Inspect current pattern generator schema, generator implementation,
  rule metadata type, `rules.json`, README guidance, and official Nx/Grit
  evidence packs.
- [x] 2.3 Capture fresh command proof for current generator behavior in a
  dry-run transcript.
- [x] 2.4 Record whether command selector and baseline contract repairs have
  landed before any registered-rule write path is implemented.
- [x] 2.5 Refresh official Effect docs and local Effect adoption evidence before
  designing any registered-promotion orchestration.

## 3. Pattern Authority Manifest

- [x] 3.1 Add a structured Pattern Authority Manifest schema with the accepted
  fields from `design.md`.
- [x] 3.2 Define and validate registered manifest source-artifact storage
  adjacent to the Habitat rule pack.
- [x] 3.3 Add validation for missing, malformed, placeholder, contradicted, and
  orphan manifest states.
- [x] 3.4 Add the `rules.json` `manifestPath` reference contract for
  generated registered rules; actual registered writes remain open.
- [x] 3.5 Validate that Habitat authority metadata is not accepted solely from
  Grit frontmatter or prose.
- [x] 3.6 Validate that Nx generator schema fields are treated as option/prompt
  input only, not accepted Habitat authority.

## 4. Generator State Machine

- [x] 4.1 Split candidate pattern generation from registered rule generation.
- [x] 4.2 Ensure candidate generation does not write `rules.json`, baselines, or
  hook scope.
- [x] 4.3 Refuse registered output unless the manifest passes authority,
  proving-source, scan-root, fixture, false-positive, current-tree, baseline,
  and hook-scope gates.
- [x] 4.4 Remove scaffold/default authority values from the registered path.
- [x] 4.5 Prevent `lane: "enforced"` and `hookScope: "pre-commit"` defaults
  for sparse generator output.
- [x] 4.6 Preserve duplicate `ruleId`, duplicate `patternName`, and existing
  baseline refusal behavior.
- [x] 4.7 Emit Grit-native frontmatter and explicit language declaration for
  registered advisory generated patterns; registered enforced scratch output
  remains open under 8.6.
- [x] 4.8 Block registered promotion until the Effect fit decision is accepted;
  use accepted Effect-backed services if command/file proof orchestration fits
  the slice.

## 5. Baseline, Grit, And Hook Boundaries

- [x] 5.1 Consume the accepted rule-introduction baseline manifest contract
  shape from `habitat-scaffold-contract-repair` as a required registered
  manifest reference; baseline write behavior remains owned by the baseline
  packet.
- [x] 5.2 Keep baseline file creation/refusal under the baseline owner; do not
  duplicate baseline policy in generator code.
- [ ] 5.3 Require native Grit fixture proof and current-tree scan status before
  enforced registration.
- [ ] 5.4 Require hook-scope rationale, staged-scope evidence, and cost/scope
  evidence before pre-commit registration.
- [ ] 5.5 Keep Grit adapter semantics and existing pattern proof repair outside
  this packet.

## 6. Tests

- [x] 6.1 Add unit tests for candidate generation output.
- [x] 6.2 Add unit tests for registered advisory output; registered enforced
  output remains blocked until native/current-tree/hook proof is accepted.
- [x] 6.3 Add schema tests for missing, malformed, placeholder, and accepted
  manifests.
- [x] 6.4 Add no-write tests for refused registration.
- [x] 6.5 Add duplicate id/name tests.
- [x] 6.6 Add hook-scope refusal tests.
- [x] 6.7 Add baseline-manifest dependency tests.
- [x] 6.8 Add native Grit sample proof for the generated registered advisory
  sample; registered enforced scratch proof remains open under 8.6.
- [x] 6.9 Add tests proving Nx schema, Grit frontmatter, and Habitat authority
  manifest fields cannot substitute for each other.
- [ ] 6.10 Add tests for the registered-promotion orchestration decision:
  candidate generation without registered writes, accepted Effect-backed
  promotion when selected, and blocked promotion when the Effect decision is not
  accepted.

## 7. Downstream Realignment

- [x] 7.1 Update README and root AGENTS generator guidance.
- [x] 7.2 Update Grit corpus ledger row guidance for generated pattern
  manifests.
- [x] 7.3 Update `habitat-generators-migrations` records to mark the old pattern
  generator closure as historical for authority metadata.
- [ ] 7.4 Update `habitat-grit-proof-repair` dependencies if existing current
  rules require backfilled manifests.
- [ ] 7.5 Update `habitat-scaffold-contract-repair` downstream records if the
  final manifest path or rule-introduction interface changes.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
- [x] 8.2 Pattern Authority Manifest schema matrix
- [x] 8.3 Candidate generator command proof
- [x] 8.4 Refused registration no-write proof
- [x] 8.5 Registered advisory generation proof
- [ ] 8.6 Registered enforced generation proof in scratch path
- [ ] 8.7 Native Grit fixture proof
- [x] 8.8 Baseline-manifest dependency proof at the manifest/reference
  contract boundary
- [x] 8.9 README/AGENTS stale guidance scan
- [ ] 8.10 Full-depth-language guardrail scan over active Habitat initiative
  docs touched by this packet
- [x] 8.11 `git diff --check`
- [x] 8.12 `bun run openspec:validate`
- [x] 8.13 Effect fit decision proof for registered promotion, including typed
  failures, command provenance, service substitution, scoped cleanup, and
  no-write behavior.

## 9. Closure

- [ ] 9.1 Record verification results and proof boundaries in
  `workstream/phase-record.md`.
- [ ] 9.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [ ] 9.3 Ensure downstream realignment ledger is patched or has exact remaining
  actions.
- [ ] 9.4 Commit through Graphite with a clean worktree.
