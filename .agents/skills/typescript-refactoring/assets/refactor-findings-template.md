<!--
COPY this file to report a refactor/quality review. Findings are ranked by the
priority tiers below; lead with the simpler design, phrase each as a question
that proposes the fix (the "good phrases" voice in SKILL.md). Be demanding, not
rude. Cut nit-floods — group trivia into one line.
-->

# Refactor Findings — <target> (<date>)

## Verdict
<!-- One of: approved · approved-with-changes · blocked. Behavior-correct is NOT the bar. -->
**Verdict:** 
**The simpler model:** <one sentence — the design this should become>
**State-space delta if applied:** <reachable states before → after; what the compiler would enforce>

## Presumptive blockers
<!-- Any one of these blocks approval. Quote the location. -->
- [ ] Incidental complexity a type-level move would delete is left in place — `<file:line>`
- [ ] New escape hatch without justification (`any`/`as`/`!`/`@ts-ignore`) — `<file:line>`
- [ ] Abstraction with one call site / fails the swap test — `<file:line>`
- [ ] Module crossed the size tripwire without decomposition — `<file:line>`
- [ ] Helper reimplemented instead of reused — `<file:line>`
- [ ] Public types drifted silently, or `tsc --strict`/tests not green — `<file:line>`

## Findings (ranked)
<!-- Priority tiers, highest first. Drop tiers with nothing to report. -->

### P1 — Structural regression / missed state-space collapse
- **Finding:** `<file:line>` — <what>
  - **Why:** <state-space / maintainability cost>
  - **Move:** <technique → refactoring-mechanics.md> · target shape → <paradigms-and-patterns.md / dev:typescript>
  - **Comment:** "<lowercase PR-comment proposing the fix>"

### P2 — Avoidable branching / flag or optional soup (a missing model)
- **Finding:** …

### P3 — Boundary / type-contract / escape-hatch leak
- **Finding:** …

### P4 — Over-/under-engineering · file size / decomposition
- **Finding:** …

### P5 — Naming / style / slop / legibility
<!-- Group trivia; do not flood. -->
- **Finding:** …

## Before → after (for the top finding)
```ts
// before

```
```ts
// after

```

## Mandate self-check (if you did the refactor)
- [ ] state-collapse · [ ] deletion · [ ] compiler-proof · [ ] reuse · [ ] naming-coherence · [ ] swap · [ ] behavior-preservation · [ ] reader
