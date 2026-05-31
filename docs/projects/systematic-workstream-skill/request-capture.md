# Systematic Workstream Skill Request Capture

Built: 2026-05-31

Source: user request after completion of the Civ7 resource-distribution recovery workstream.

## Parsed Intent

Create a reusable repo-local skill that captures the systematic operating method that made the resource-distribution recovery succeed over a long, multi-phase run. The skill should be generic enough to apply to future systematic workstreams, but it should retain the concrete bones of the Civ7/resource case so agents can actually execute it rather than reciting high-level process advice.

The immediate next workstream is not to fix resources again. It is to design, draft, review, and harden the skill itself as a workstream. That workstream should use fresh agents, session/introspection tools, prior conversation evidence, repo-local skill examples, information design, and skill-design review loops before declaring the skill operational.

## Intended Skill Shape

The skill should stand alone in this repository and be reusable for tasks like:

- Systematic Civ7 resource planning and placement.
- Feature, biome, brushing, ecology, woodland/tree, terrain, or tile-type systematic passes.
- Any domain where the implementation must enumerate the official/canonical domain corpus, ground expectations in external or physical evidence, translate each entity or group into architecture-aligned operations, verify with local statistics, and then prove behavior in runtime logs.

It should not be resource-only. Resource distribution is the motivating case and should appear as an example, not as the only domain model.

## Required Workstream For Creating The Skill

The skill-generation workstream should itself follow the systematic method:

1. Frame the objective using `framing-design`, including what the skill is for, what is out of scope, the hard core, and what would force a reframe.
2. Start from a clean repo/worktree process, inspect Graphite state, and keep the worktree clean at closure.
3. Use session/introspection tools to inspect the completed resource-distribution session and extract where the method solidified across user instructions, agent actions, review loops, runtime proof, and closure discipline.
4. Close old agents and spawn only fresh agents. Use up to 6 agents, each with a prompt framed using `framing-design`; treat agents as peers with enough context to reason well.
5. Run multiple evidence angles in parallel, such as:
   - session-method extractor,
   - repo-local skill/prior-art reviewer,
   - Civ7/OpenSpec workflow mapper,
   - information-design reviewer,
   - operational-risk reviewer,
   - future-use-case stress tester for features/biomes/brushing.
6. Compose an initial skill plan before drafting the skill.
7. Draft the repo-local skill with a compact router `SKILL.md` and only necessary references/assets.
8. Review the draft against skill-design quality, information design, repo conventions, and concrete future use cases.
9. Iterate until the skill is operationally specific, generic enough to reuse, and not a vague process checklist.
10. Validate file paths, links, frontmatter, and repo conventions; record what was reviewed and what remains intentionally deferred.

## Systematic Approach The Skill Must Preserve

The reusable method should make these steps explicit:

1. Establish the frame and workstream contract.
   - Define the actual objective, success evidence, non-goals, expected artifacts, phase sequence, closure gates, and review cadence.
   - Create durable workstream notes before implementation, not after memory starts failing.

2. Isolate and map the repo state.
   - Work in a clean worktree/Graphite slice.
   - Identify stack position, dirty work, downstack dependencies, commit hotspots, and generated/read-only artifacts.
   - Protect unrelated user or agent changes.

3. Diagnose before designing.
   - Use code search, git history, hotspots, Narsil MCP where useful, logs, tests, and runtime artifacts to identify the real failure mode.
   - Avoid jumping straight to tuning or implementation before the observed behavior is explained.

4. Extract the canonical corpus.
   - Identify every official domain entity from authoritative in-repo sources first.
   - For Civ7 this includes official resources in `.civ7/outputs/resources`; for future tasks it may be features, biome values, brush types, terrain classes, yields, or other official catalogs.
   - Produce a structured artifact that names every entity, ID/value, source, and current implementation coverage.

5. Group the corpus into coherent work slices.
   - Split entities by shared inputs, constraints, expected outputs, and architecture boundaries.
   - Each resource/feature/biome group should become a phase or slice when that improves reviewability and verification.

6. Ground expectations externally and physically.
   - For each entity or group, pre-generate expected values before implementation.
   - Use earthlike realism or the relevant physical/ecological baseline: climate, hydrology, latitude, elevation, terrain, biome, geology, landform, adjacency, rarity, and distribution shape.
   - Preserve evidence quality and uncertainty. Do not replace "expected range" with false precision.

7. Translate expectations into architecture-aligned operations.
   - Each entity or group needs an explicit strategy that fits the repo architecture.
   - In Civ7 MapGen terms, prefer dedicated operations, contracts, artifacts, score layers, and deterministic planners over ad hoc stamps or hidden random gates.

8. Implement in reviewable slices.
   - Map each slice to an OpenSpec change or equivalent workstream artifact.
   - Keep branch/layer boundaries meaningful and preserve local commit state separately from external PR/submission claims.

9. Verify with local statistics before runtime.
   - Generate expected ranges per condition, then compare observed stats over stable seeds/configs.
   - Prove coverage, distribution, diversity, legality, mismatch/rejection counts, and per-type spread.
   - Add targeted gates when a regression can be made deterministic.

10. Prove behavior in the actual runtime environment.
   - Restart the app/game through the current canonical path, not stale commands.
   - Record exact branch, commit, command/API path, request IDs, log paths, timestamps, parsed payloads, and any manual boundaries.
   - Treat runtime logs as evidence only when they are fresh, bounded, parseable, and tied to the branch being claimed.

11. Use review loops as phase gates.
   - Have agents review specs, implementation, evidence ledgers, and closure records before moving forward.
   - Treat stale task records, overclaims, and mismatched proof as blockers.

12. Close deliberately.
   - Update records to match actual state.
   - Keep worktree clean.
   - Distinguish local commit complete, Graphite submit/PR complete, runtime proof complete, and final product proof complete.
   - Preserve handoff packets and next-step packets when work continues.

## Non-Goals

- Do not create a resource-only skill.
- Do not write a broad "be systematic" checklist without concrete phase gates, artifacts, and evidence standards.
- Do not omit agent/team prompting requirements.
- Do not skip session introspection or prior-art review.
- Do not claim runtime/product proof without fresh evidence tied to the current branch and restart path.

## Framed Objective Requested For Next Turn

The next-turn objective should ask the agent to create the skill through a workstream, not merely draft prose. It should require fresh agents, framed prompts, session analysis, repo-local skill prior art, information design review, iteration, validation, and clean Graphite closure.

```text
Create a workstream whose deliverable is a reusable repo-local skill for systematic, evidence-grounded problem resolution. The future state is: an agent can invoke the skill for the next Civ7 systematic task, such as features, biomes, brushing, ecology, terrain, or tile types, and get the same disciplined behavior that made the resource-distribution recovery work: explicit framing, complete corpus extraction, physically grounded expected ranges, architecture-aligned per-entity strategies, sliced implementation, statistical verification, runtime proof, agent review, and clean Graphite closure.

Use the resource-distribution session as the seed case, not the whole scope. First inspect the prior session with available session/introspection tools and the durable records in the repo/worktrees. Close prior agents and use only fresh agents, up to 6, with every prompt framed via framing-design and written as peer context. Run the skill creation as its own workstream: plan first, then gather evidence, draft, review, iterate, validate, and close cleanly.

The skill must preserve these generic bones: 1. frame objective and proof gates; 2. isolate repo/worktree/stack state; 3. diagnose root cause before solution; 4. extract every canonical domain entity from official sources; 5. group entities into reviewable phases; 6. research physical/ecological/earthlike expectations per entity or group; 7. translate expectations into architecture-aligned operations/artifacts/contracts; 8. implement or plan slices in the repo's OpenSpec/Graphite style; 9. compare observed stats against predeclared expected ranges; 10. prove behavior in the actual runtime/log environment using the current canonical restart path; 11. review specs, implementation, evidence, and closure records with agents; 12. close with accurate commit/proof/PR boundaries and a clean worktree.

Design the skill to be generic and operationally specific. Include Civ7 examples for resources and for future features/biomes/brushing, but avoid a resource-only skill and avoid vague "be systematic" advice. Review the draft against repo-local skill conventions, information design, and future-use stress cases. Finish with a compact SKILL.md plus only necessary references/assets, validation evidence, and a short handoff describing what the skill does, when to use it, and what would force a redesign.
```
