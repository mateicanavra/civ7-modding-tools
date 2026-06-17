<!--
COPY this file to your working notes before touching code. Fill it as you go;
it doubles as the execution log and the definition-of-done checklist.
Driven by .agents/skills/typescript-refactoring/SKILL.md (the Default Workflow).
Delete these comment blocks once filled.
-->

# Refactor Plan — <target: file / module / subsystem>

## 1. Intent & contract (answer before touching code)
- **What this code is supposed to do:**
- **The simpler model it is failing to be:**
- **Behavior that MUST stay fixed (the contract):**
- **Public types / exported surface that MUST stay fixed:** <!-- if this changes, hand off to dev:api-design -->
- **Blast radius:** local module / crosses a boundary (→ cognition:domain-design) / public API (→ dev:api-design)

## 2. Safety net
<!-- The compiler is a net; tests pin behavior. Design the net before changing behavior. → cognition:testing-design -->
- **Existing tests that pin behavior:**
- **Characterization tests to add first (if behavior is unpinned):**
- **Green baseline command(s):** `tsc --noEmit` (strict) · `<test cmd>` · `<lint cmd>`

## 3. Smell inventory (detect)
<!-- Use references/smell-catalog.md + the detection toolkit. -->
| # | Smell | Location | Detection signal (grep/tool) | Reachable-state cost |
|---|---|---|---|---|
| 1 |  |  |  |  |

## 4. Ranked targets (triage)
<!-- Order by leverage: state-space collapse first, then deletions, then placement. -->
| Rank | Target | Move (→ refactoring-mechanics.md) | Expected state-space delta | Risk |
|---|---|---|---|---|
| 1 |  |  |  |  |

## 5. Step sequence (transform)
<!-- One logical move per step; tsc --strict + tests green after EACH. One commit per step. -->
- [ ] Step 1: <move> — checkpoint: tsc green · tests green · committed
- [ ] Step 2: …

## 6. Generated/LLM code? (run first)
<!-- If the target is AI-generated or structureless, run the triage in references/llm-slop-cleanup.md before deeper refactoring. -->
- [ ] Slop triage done (names, dead code, premature abstraction, reimplementation, escape hatches)

## 7. Definition of done (the Approval Bar)
- [ ] Reachable-state count measurably dropped (state-collapse test)
- [ ] Complexity deleted, not relocated (deletion test)
- [ ] Invariants compiler-enforced (DU + `never` / branded / parse-at-boundary), not by comment/convention
- [ ] No new escape hatch (`any`/`as`/`!`/`@ts-ignore`) without written justification
- [ ] No abstraction with <2 call sites / failing the swap test
- [ ] Existing helpers reused, nothing reimplemented (reuse test)
- [ ] Names coherent: file ↔ export ↔ concept (naming-coherence test)
- [ ] Behavior + public types preserved (or changed intentionally and recorded)
- [ ] `tsc --strict`, tests, lint green
- [ ] Fewer concepts to hold in the head (reader test)

## 8. Notes / deferrals
- 
