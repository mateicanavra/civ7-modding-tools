## 1. Correct The Candidate Frame

- [x] 1.1 Reject the synthetic exported-helper, fake-only, `Effect.never`, and
  `TestClock` test-drain hypothesis.
- [x] 1.2 Keep command policy internal and assign native process ownership to
  `tools/habitat`.
- [x] 1.3 Define the sampled POSIX process-group guarantee and its identity-reuse
  residual without claiming continuous presence or absolute ABA prevention.

## 2. Bound Command And CLI Lifecycles

- [x] 2.1 Acquire Darwin/Linux provider commands as detached process groups in
  an Effect scope before startup is admitted.
- [x] 2.2 Implement bounded group-first TERM, sampled liveness, conditional KILL,
  direct-child fallback, and explicit incomplete release.
- [x] 2.3 Carry one `AbortSignal` through every CLI service call, dispose the
  managed runtime before replay, preserve the first native signal, and bound
  stuck disposal.
- [x] 2.4 Prove live timeout, descendant-only release, TERM exit, TERM/absence,
  forced KILL, incomplete release, mixed-signal replay, and normal completion
  with bounded fixtures.

## 3. Bound Diagnostic And Structure Work

- [x] 3.1 Fix native Grit at `RAYON_NUM_THREADS=2` and keep execution units
  sequential.
- [x] 3.2 Batch only eligible checks with exact ordered canonical roots and
  distinct pattern identities.
- [x] 3.3 Materialize assets before catalog acquisition, isolate invalid assets,
  preserve selected-order outcomes, and attribute shared timing only to
  admitted rules.
- [x] 3.4 Reuse path-kind, directory-entry, and completed-walk observations only
  within one `runStructureRulesEffect` invocation.
- [x] 3.5 Prove grouping, failure containment, installed pinned-native batching,
  traversal reuse, and per-invocation traversal freshness.

## 4. Candidate Verification

- [x] 4.1 Habitat standalone/source lint passes with zero errors.
- [x] 4.2 Habitat source, test, and tooling TypeScript lanes pass.
- [x] 4.3 Uncached standalone behavior passes: 138 passed, 2 platform skips.
- [x] 4.4 Source-backed Habitat suite passes: 42 files, 481 passed, 2 platform
  skips; the artifact-only moved-binary suite remains a release gate.
- [x] 4.5 Focused owned-process proof passes 7 of 7; service-context proof passes
  1 of 1; installed pinned-native current-tree proof passes 13 of 13.
- [x] 4.6 `bunx openspec validate deep-habitat-effect-command-timeout-test-drain --strict`
- [x] 4.7 `git diff --check`

## 5. Owner Release Gates

- [ ] 5.1 Build fixed standalone assets with the pinned compiler and pass the
  moved-binary acceptance suite outside the checkout.
- [ ] 5.2 Push and qualify a nonpublishing `habitat-sdk-probe-*` tag.
- [ ] 5.3 Publish the next `habitat-sdk-v*` tag only after the probe matrix is
  green.
