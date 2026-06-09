# Agent 5: Verification, DX, and Closure Prosecutor

Date: 2026-06-09
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/river-lake-adversarial-synthesis`
Role: adversarial proof-ladder, DX, and closure prosecutor

## 1. Framed Objective

### Frame placement

- Cynefin: complicated
- Object: objective
- Lifecycle: second-order revision
- Mode: audience-export
- Durability: standalone

### Framed objective

Prevent any future false closure on river/lake recovery by enforcing an
audit-grade proof ladder from Hydrology truth through rendered Civ visibility,
with same-run evidence boundaries, explicit no-signal typing, reviewer
disposition gates, and Studio/debug UX that tells users exactly why rivers are
or are not visible.

### Active goal

Audit the current proof chain, identify every proof leap and DX gap, and define
the exact acceptance matrix and stop conditions required before any slice or the
overall workstream can claim rivers/lakes are working in product terms.

### Selection, salience, exterior

- In scope:
  - `hydrology-truth` through `product-acceptance`
  - same-run parity boundaries
  - direct-control camera/screenshot/runtime proof
  - Studio inspection and reviewer-facing evidence surfaces
  - closure language and disposition policy
- Foregrounded:
  - false proof inflation risk
  - same-run identity binding
  - typed low/no-signal outcomes
  - user-visible debugging surfaces
- Exterior:
  - hydrology algorithm redesign itself
  - projection tuning itself
  - new runtime authoring paths beyond proof needs

### Hard core

No proof class may stand in for a stronger proof class. Product closure requires
same-run rendered evidence and reviewer disposition, not green internal tests or
terrain parity alone.

### Falsifier

This frame fails if the repo already has a direct-control camera+screenshot
runner, a Studio river/lake inspector, and closure gates that prevent parity or
manual screenshots from being generalized into product proof.

### Structural alternative considered and rejected

Alternative frame: treat this as only a test-suite hardening task.

Rejected because the larger failure is not missing tests alone; it is mixed
proof classes, weak evidence contracts, and absent user/reviewer DX surfaces.

## 2. Investigation Brief

### Investigation type

- Codebase deep dive
- Doc-vs-code reconciliation
- Decision support for OpenSpec execution changes

### Frame stability

Committed. The workstream already has an execution redesign authority packet; my
job is to attack its proof and closure posture, not re-litigate the whole train.

### Evidence standard

Audit-grade for closure claims. Directional evidence is allowed only for
planning, not for pass labels.

### Search geometry

- Depth-first on the proof ladder
- Graph trace from exact-authorship -> parity -> visible proof -> Studio UX
- Contradiction-seeking posture

### Primary questions

1. What proof classes exist today, in code and spec, and what do they actually
   prove?
2. Where can current tooling overclaim due to missing same-run identity,
   missing runtime capture, or manual evidence?
3. What exact pass/block/out-of-scope matrix should govern rivers, lakes, and
   floodplains?
4. What Studio/debugging surfaces are required so users and reviewers can
   diagnose failures without reading code?

### Secondary questions

1. Which proof links are already strong and should be reused rather than
   reinvented?
2. Which negative controls are required so wrong-map, wrong-seed, off-target,
   and no-signal cases are distinguishable?

### Exclusion questions

1. Do not reopen hydrology ownership or map-policy ownership here.
2. Do not solve projection tuning here.
3. Do not invent new architectural owners.

### Falsification questions

1. Can `civ-rendered` currently pass without `exact-authorship` being proven?
2. Can a manual or arbitrary screenshot artifact satisfy the current visible
   proof contract?
3. Does Studio currently expose the river/lake proof ladder in product UI, or
   only in specs?

### Evidence policy

- Source priority:
  1. active execution redesign authority
  2. OpenSpec requirements/tasks
  3. implementation code
  4. tests
  5. package docs/readmes
- On conflict, code beats task checkboxes about what exists now; authority docs
  beat code about what is allowed to claim.
- Confidence language:
  - `proven` only for enforced contracts in code/spec
  - `present but weak` for evidence that exists without closure strength
  - `missing` when no implementation exists

### Stop/reframe conditions

- If direct-control camera/screenshot wrappers already exist and are wired into
  visible proof, reframe the gap to reviewer policy only.
- If Studio already has a river/lake inspector hidden behind existing naming,
  reframe DX findings around discoverability and status semantics.

## 3. Notes / Evidence Log

1. The controlling execution redesign packet already separates proof classes and
   forbids proof inflation. It defines `hydrology-truth`, `projection-plan`,
   `terrain-readback`, `metadata-readback`, `studio-visible`, `civ-rendered`,
   and `product-acceptance` as distinct claims and says the workstream stays
   open until all eight closure rows are proven.
   Ref: `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md:134-147,258-276`

2. The parity model already encodes those proof labels in source and explicitly
   marks several of them unresolved by design. `studio-visible` says parity does
   not prove Studio UX, `civ-rendered` says no same-run screenshot proof is
   attached, and `product-acceptance` says parity packets do not close product
   acceptance.
   Ref: `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts:137-161,1241-1283`

3. The parity tests already assert this separation: even when exact authorship,
   terrain-readback, and metadata-readback pass, `civ-rendered` and
   `product-acceptance` remain unresolved.
   Ref: `mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts:341-350`

4. The `river-runtime-visible-proof` change is mostly unimplemented. Runtime
   primitive inventory, direct-control camera wrappers, screenshot capture,
   negative controls, and live proof attachment are still open.
   Ref: `openspec/changes/river-runtime-visible-proof/tasks.md:1-20`

5. The runtime-visible-proof design correctly wants one packet containing exact
   run identity, live map identity, sampled tiles, camera state, screenshot
   hashes, and a visual verdict. It also says direct-control should own runtime
   map/camera operations, with OS screenshots only as a labeled fallback.
   Ref: `openspec/changes/river-runtime-visible-proof/design.md:3-17`

6. Current implementation is only a verifier/packet builder. It accepts
   screenshot paths, camera target/source, verdict, and parity proof as inputs;
   it does not capture them itself.
   Ref: `scripts/civ7-direct-control/verify-river-visible-proof.ts:18-31,99-116`

7. The current visible-proof verifier blocks on terrain-readback pass, sampled
   live river tiles, camera target/source, screenshot presence, and verdict
   presence. It does not block on `exact-authorship` claim status, does not
   require `metadata-readback`, and does not authenticate that the screenshot
   came from the actual run.
   Ref: `scripts/civ7-direct-control/verify-river-visible-proof.ts:237-260`

8. The visible-proof tests prove the weakness above: a fake screenshot file with
   `cameraSource: "manual"` and `captureMode: "manual-file"` can produce
   `ok=true`.
   Ref: `scripts/civ7-direct-control/verify-river-visible-proof.test.ts:14-63`

9. Current direct-control capabilities cover reveal and map reads, including
   hydrology readback (`riverType`, `river`, `navigableRiver`, `lake`) and map
   visibility state, but I found no first-class camera-center/zoom/screenshot
   wrapper in the package or tests.
   Ref:
   - `packages/civ7-direct-control/src/play/map/visibility.ts:128-187`
   - `packages/civ7-direct-control/src/play/map/reads.ts:232-300`
   - `packages/civ7-direct-control/README.md:89-102`
   - `rg "camera|zoom|screenshot|capture|screen" packages/civ7-direct-control/src packages/civ7-direct-control/test scripts/civ7-direct-control`

10. The river-writer probe already uses the right evidence boundary language: a
    runtime hook is not production authoring evidence until same-run parity can
    read it back, and even then source-integrated semantics remain required.
    Ref: `scripts/civ7-direct-control/probe-river-writer.ts:252-301`

11. Studio already has strong exact-authorship identity plumbing for Run in Game
    proof, including config/envelope hashes, deployed script identity, setup
    readback, runtime seed/dimensions/game hash, and log proof links.
    Ref:
    - `apps/mapgen-studio/src/server/runInGame/proofIdentity.ts:64-191`
    - `openspec/changes/studio-civ7-exact-authorship-proof/specs/mapgen-studio/spec.md:3-26`

12. Studio does not appear to have an implemented river/lake inspector yet. The
    inspector exists as a spec requirement, but source/test search did not find
    a corresponding product surface for planned minor, planned major, projected
    navigable, metadata divergence, or no-signal explanation.
    Ref:
    - `openspec/changes/studio-river-lake-inspector-dx/specs/mapgen-studio/spec.md:3-21`
    - `rg "River/Lake Inspector|planned minor|planned major|projected navigable|metadata divergence|no-signal|river inspector|lake inspector|floodplain" apps/mapgen-studio/src apps/mapgen-studio/test`

13. The navigable-coherence slice already defers config rebaseline until
    same-run proof passes. That is correct and should stay.
    Ref: `openspec/changes/map-rivers-navigable-coherence/tasks.md:9-15`

14. The `map-rivers` step already emits typed projection signal states:
    `normal-signal`, `arid-low-signal`, `closed-basin-low-signal`, and
    `terrain-constrained-low-signal`. These are useful, but closure policy still
    needs to classify which ones are product-acceptable and which ones are open
    defects.
    Ref: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/steps/plotRivers.ts:22-104,225-240`

## 4. Findings, Gaps, Risks, and Attacks

### A. Current proof ladder is conceptually correct but not operationally closed

The architecture of the proof ladder is now good. The operational enforcement is
not. The repo can describe the right ladder while still allowing weaker proof
artifacts to masquerade as stronger ones.

### B. `civ-rendered` is currently vulnerable to a proof leap

The biggest concrete bug: `verify-river-visible-proof.ts` can report success
without enforcing exact-authorship completeness. It carries
`exactAuthorshipSummary`, but its blocker set does not require the parity packet
to have `proofClaims["exact-authorship"].status === "pass"`.

Attack: a screenshot can be attached to a parity object from an unresolved or
mismatched run chain and still satisfy current visible-proof logic if terrain
readback passed and the target is sampled.

### C. Manual screenshot artifacts are too weak for closure

Current verifier tests explicitly allow `manual-file` screenshots and
`manual-review` verdicts to satisfy the proof. That is acceptable for
exploration or debugging. It is not strong enough for `product-acceptance`.

Attack: the screenshot hash only proves file identity, not that the image came
from the live target run, the sampled tile, the stated zoom, or the current
graphics/visibility state.

### D. Direct-control lacks the runtime primitives required for same-run visual proof

Current direct-control has reveal and map reads, but not the first-class camera,
zoom, screenshot, or viewport-state capture surface required by the
`river-runtime-visible-proof` design. That means the repo cannot yet produce a
fully bound same-run rendered-river proof packet from its canonical runtime
tooling.

### E. Studio exact-authorship is stronger than river DX right now

Studio already binds authorship identity far better than visible-river proof
does. The exact-authorship side knows how to prove "this was the authored run";
the river visibility side still mostly proves "someone provided a screenshot and
a target tile."

### F. Studio product DX is missing the river/lake status ladder

The required inspector exists in spec only. Users currently lack a stable
surface that explains:

- planned minor rivers
- planned major rivers
- projected navigable subset
- live terrain readback
- live metadata divergence
- typed no-signal reason
- whether the current run is eligible for visual acceptance at all

Without that ladder, users will continue to infer failure from absence of a
visible river and the team will keep losing time reconstructing state from code.

### G. No-signal typing needs acceptance semantics, not just telemetry names

The projection step exposes four statuses, but only two are clearly physical
low-signal outcomes:

- `arid-low-signal`
- `closed-basin-low-signal`

`terrain-constrained-low-signal` is not a physical acceptance state. It is a
projection/materialization limitation and should block closure until repaired or
explicitly reclassified with evidence.

### H. Reviewer disposition is still too implicit

The workstream authority says product acceptance requires reviewer disposition,
but current proof packets do not encode the reviewer matrix that determines when
a run is accepted, blocked, or downgraded to exploratory only.

### I. Same-run negative controls are missing

Without explicit wrong-map, wrong-seed, off-target, hidden-visibility, and
no-river controls, the proof system can drift into vacuous green checks. The
OpenSpec task list correctly marks these negative controls as not done.

## 5. Recommended Workstream Changes and Closure Criteria

### 5.1 Tighten `river-runtime-visible-proof`

Required contract changes:

1. `civ-rendered` pass must require `exact-authorship=pass`, not just a carried
   summary.
2. `civ-rendered` pass for closure must require `cameraSource=direct-control`
   and `captureMode=direct-control`.
3. `manual-file` and `os-fallback` evidence may exist, but they must downgrade
   the verdict to `inconclusive` or `debug-only`, never `product-acceptance`
   eligible.
4. Proof packet must include current graphics/visibility state, camera target,
   zoom, and at least one screenshot per sampled chain or per accepted sample
   rule.
5. Negative controls must verify:
   - wrong run/request chain blocks
   - off-target screenshot blocks
   - no live river samples blocks
   - hidden/unrevealed state blocks

### 5.2 Add a formal acceptance matrix

| Proof class | Minimum pass condition | Allowed weaker state | Blocks product acceptance when... |
| --- | --- | --- | --- |
| `exact-authorship` | full Studio request -> materialization -> deployed script -> setup -> runtime -> log chain complete | unresolved for debugging | any mismatch or unresolved link |
| `hydrology-truth` | routed network metrics and physical benchmarks pass for current acceptance seed/matrix | unresolved during upstream work | unresolved or failed |
| `projection-plan` | projected navigable subset and signal typing match intended class | exploratory tuning | unresolved or failed |
| `terrain-readback` | live terrain rows match projected navigable terrain | exploratory local proof | unresolved or failed |
| `metadata-readback` | live Civ river metadata semantics proven, or explicitly marked unsupported/out-of-scope with evidence | unsupported writer scope | claimed pass without proof, or unresolved when still inside closure scope |
| `studio-visible` | Studio shows same-run river/lake layers and mismatch ladder coherently | spec-only | source surface absent or misleading |
| `civ-rendered` | direct-control camera target + direct-control capture + visible river at sampled live tile | manual debug capture | manual-only capture, wrong-target, hidden state, or unresolved authorship |
| `lake-final` | active exact lake counters reconcile | exploratory counters | unresolved or failed |
| `floodplain-active` | active same-run floodplain proof row exists | not yet attempted | unresolved or failed |
| `product-acceptance` | all required rows above dispositioned by reviewers | none | any required row unresolved, failed, or scoped incorrectly |

### 5.3 Add explicit no-signal closure policy

| Signal status | Meaning | Closure posture |
| --- | --- | --- |
| `normal-signal` | normal Earthlike visible navigable trunks expected | lack of visible rivers is a failure/block |
| `arid-low-signal` | physically sparse visible trunks expected | may pass without obvious rivers if Studio and Civ proof both show consistent typed low-signal |
| `closed-basin-low-signal` | internally drained basin dominance; low visible trunks may be correct | may pass without obvious rivers if lake/terminal proof is coherent |
| `terrain-constrained-low-signal` | engine/projection constraint suppressed visibility | cannot pass product acceptance; treat as defect/open repair |

### 5.4 Add reviewer disposition lanes

Required reviewers for product-eligible runs:

1. Runtime proof reviewer:
   confirms exact-authorship chain, sample targeting, camera/capture source, and
   artifact integrity.
2. Product reviewer:
   confirms a user would understand the Studio ladder and that the rendered Civ
   outcome matches the typed status.

Reviewer outputs should be durable and row-based, not buried in chat.

### 5.5 Ship the Studio river/lake inspector as a closure dependency, not optional DX

The inspector should expose:

- non-debug default:
  - planned minor count
  - planned major count
  - projected navigable count
  - live terrain river count
  - signal status
  - concise status explanation
- explicit debug lanes:
  - metadata readback counts
  - mismatch counts
  - sampled target tiles/chains
  - screenshot artifacts/hashes
  - exact-authorship identity chain
  - closure eligibility state

### 5.6 Stop conditions for not overclaiming again

The workstream must not claim "rivers work" when any of the following is true:

1. `civ-rendered` proof used manual-file or OS fallback capture.
2. `exact-authorship` is unresolved.
3. `terrain-constrained-low-signal` is the active explanation.
4. Studio lacks the same-run river/lake inspector for the evaluated run.
5. Metadata behavior is being described beyond the proven writer scope.
6. Product reviewer disposition is absent.
7. The tested run is not the exact run users are inspecting.

## 6. Final Synthesis

The proof taxonomy is mostly corrected at the design level, but the current
implementation still allows the exact failure mode we are trying to prevent:
manual and partially bound evidence can be upgraded into product-sounding river
claims. The immediate closure work is not more projection tuning. It is to make
`river-runtime-visible-proof` enforce exact-authorship and direct-control-bound
capture, to ship the Studio river/lake ladder, and to make typed no-signal
statuses participate in product acceptance rules instead of existing only as
telemetry.
