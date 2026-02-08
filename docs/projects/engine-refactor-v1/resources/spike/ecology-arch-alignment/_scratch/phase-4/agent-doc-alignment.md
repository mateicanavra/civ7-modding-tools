# Agent 1 Scratch: Doc/Spec Alignment Review

Status: completed (performed by ORCH due to agent spawn limits)

## Contradictions

1. **Phase status drift (Phase 3 hardening is no longer “next”)**
   - Doc: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/ecology/ECOLOGY.md`
     - Says: Phase 3 artifact is “skeleton only; hardening is next stage”.
   - Reality: Phase 3 hardening is complete and the canonical plan is now:
     - `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
   - Recommended SSOT for execution planning: the pipeline-realism M2 milestone (and the derived local issue docs).

2. **Spike README still frames resolved decisions as “Unknowns”**
   - Doc: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/README.md`
     - “Unknowns (still tracked)” lists:
       - biomeClassification mutability posture
       - plot-effects effect tag
       - map-ecology split
   - Reality: these are now resolved in decision packets and baked into M2:
     - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DECISIONS/README.md`
     - `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md` (acceptance + issue bodies)
   - Recommended SSOT: decision packets + M2 milestone.

3. **Project directional doc under-specifies that pipeline-realism now contains Ecology M2**
   - Doc: `docs/projects/pipeline-realism/PROJECT-pipeline-realism.md`
     - Frames the project narrowly as “fresh refactor of Foundation stage”.
   - Reality: pipeline-realism now contains:
     - M1: Foundation/Morphology maximal cutover
     - M2: Ecology architecture alignment (behavior-preserving)
   - Recommended SSOT for “what this project is”: update `PROJECT-pipeline-realism.md` to list milestones and explicitly include Ecology.

## Superseded / Archive Candidates

No hard “must-archive” docs were found for Ecology specifically. The primary confusion risk is **scratch directories** being mistaken as implementation guidance.

Action:
- Add an explicit `_scratch/README.md` under the Ecology spike package:
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/README.md`
  - Message: scratch is not canonical; implementers must follow M2 + local issues.

Note:
- We keep the spike package itself (non-scratch) as paper trail and evidence; it is referenced by M2.

## Maximal Greenfield Coverage Check

✅ Maximal greenfield intent is represented in the execution plan:
- Compute substrate is a first-class workstream (see M2 issues `LOCAL-TBD-PR-M2-005..007`).
- Atomic per-feature plan ops are explicit (M2 issues `LOCAL-TBD-PR-M2-008..011`).
- “No behavior change” posture is operationalized via gates (G0..G4), determinism labels, and stable viz-key inventory.

✅ Behavior preservation is clearly scoped and gated:
- Stable ids: stage ids, step ids, artifact ids are explicitly preserved.
- `features-plan` seam is treated as the primary hard seam with compiler-owned binding + disabled-default internal ops.

⚠️ One place where “maximal” could be misunderstood:
- The spike README’s “Potential Shapes” section still reads like a forward-looking recommendation rather than “this is now the plan”.
  - Fix: update spike README to point at the M2 milestone for the execution plan; keep spike content as background.

## Concrete Edits (Patch List)

1. Update: `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/ecology/ECOLOGY.md`
   - Replace “Phase 3 hardening is next” language with:
     - “Phase 3 hardening complete: see pipeline-realism M2 doc.”
   - Add a “Current canonical execution plan” link list:
     - `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
     - `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M2-*.md` (after breakout)

2. Update: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/README.md`
   - Convert “Unknowns (still tracked)” -> “Decisions (resolved)” and point to decision packets.
   - Add: “For execution, use pipeline-realism M2 milestone + local issue docs.”

3. Add: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/README.md`
   - Explicit “do not use scratch as implementation guidance.”

4. Update: `docs/projects/pipeline-realism/PROJECT-pipeline-realism.md`
   - Expand scope framing to “pipeline realism remediation + downstream domain alignment”.
   - Add a Milestones section linking:
     - `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
     - `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`

