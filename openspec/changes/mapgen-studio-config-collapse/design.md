# Design — config-object collapse, sticky auto-expand, per-object header

## Context

The rjsf form renders three collapsible tiers (Pass-3 elevation scheme):
stage cards (depth 1, `card`), group/array wells (depth 2, `well`), and
subgroup headings (depth ≥3, eyebrow only). Transparent paths render no
chrome and are not collapsible. The form scrolls inside
`#recipe-panel-config-section` (the RecipePanel config section). Focused mode
wraps the selected stage as `{ [stage]: schema }`, so `fieldPathId.path` —
and therefore JSON pointers — are identical in both modes.

## State model

- `expansionChoices: Map<pointer, boolean>` — explicit user choices only.
- `defaultExpanded(pointer)` = `pointer === focusRootPointer` (the focused
  stage root; null in unfocused mode). Everything else defaults collapsed.
- Manual mode: `isExpanded(p) = choices.get(p) ?? defaultExpanded(p)`.
- Sticky mode ON: `isExpanded(p) = activeChain.has(p)`; chevron clicks still
  write `choices` (they apply when the mode turns off or between scroll
  recomputations).
- The map is keyed by pointer, not mode, so expansion survives focus
  switches; switching the selected stage re-seeds only the default, never
  clears choices.

## Template plumbing (no registry)

`BrowserConfigFormContext` gains an optional member:

```ts
collapse?: {
  expandedPointers: ReadonlySet<string>; // resolved (defaults applied)
  toggle(pointer: string): void;
}
```

The expanded set is DATA, not an `isExpanded` closure, by necessity: rjsf's
`SchemaField.shouldComponentUpdate` compares props with `deepEquals`, which
assumes all functions are equivalent (lodash `isEqualWith` + function
short-circuit) — a context whose only change is a fresh closure identity
never re-renders the form. lodash compares Set contents, so membership
changes propagate. (Found live: the first closure-shaped implementation
rendered correct initial state but ignored every toggle.)

Absent ⇒ templates render today's expanded markup with no chevrons (template
unit tests, hypothetical bare `SchemaForm` consumers). Present ⇒ stage,
group, subgroup, and array templates render the header anatomy below and
gate their content on `isExpanded(pointer)`.

Collapsible sections stamp DOM data attributes instead of registering refs:
`data-config-section`/`data-config-header` + `data-config-pointer`. The
sticky engine reads them with `querySelectorAll` — robust to rjsf re-renders,
zero plumbing beyond formContext.

## Header anatomy (the per-object toolbar)

```
[chevron + title ......................... trailing action zone]
```

- Chevron (`ChevronRight`/`ChevronDown`) + title form ONE disclosure button
  (`aria-expanded`, `aria-controls` on the content region) — same pattern as
  the panel section headers.
- The trailing zone is a `flex items-center gap-1` slot reserved for
  object-local actions. The array template's Add button moves into it now;
  Reset-to-defaults / Show-JSON migrate in a later slice (they are global
  toolbar actions today).
- Stage descriptions/gs-comments render only when expanded (the header row
  stays one line when collapsed).

## Sticky engine (auto-expand on scroll)

Owned by `useConfigCollapse(scrollRootRef, { sticky, focusRootPointer })`:

1. On scroll (rAF-throttled) query `[data-config-header]` in DOM order.
2. The **candidate** is the last header whose top sits at/above the focus
   line (scroll-viewport top + 56px offset); with none above it, the first
   header.
3. `activeChain` = the candidate pointer plus all its pointer prefixes
   (ancestors are derivable from the pointer string — no tree bookkeeping).
   Cascade follows naturally: expanding a parent reveals child headers;
   scrolling onto a child header deepens the chain.
4. Recompute only when the chain actually changes (set equality) to avoid
   re-render storms.
5. **Scroll anchoring:** before applying a chain change, record the
   candidate header's viewport offset; in a layout effect after render,
   restore it by adjusting `scrollTop` — collapsing content above the focus
   line must not visually teleport the header the user is reading.

`computeActiveChain(headerPointersInDomOrder, headerTops, focusLine)` is a
pure exported helper with its own unit test; the DOM/scroll glue is verified
live.

## Decisions

- **DOM-driven engine over a ref registry** — rjsf re-renders templates
  freely; data attributes survive that without lifecycle bookkeeping.
- **Map-of-explicit-choices over a Set** — distinguishes "user collapsed the
  focused root" from "no choice yet", so defaults never fight the user.
- **No persistence** of expansion or the sticky toggle (session state;
  default OFF each load per the user's spec). Revisit only on user ask.
- **Validation visibility:** collapsed sections can hide field errors; rjsf
  surfaces submit-time errors elsewhere, and the studio form validates
  passively. Accepted for now; a header error badge is a natural follow-up
  and slots into the trailing action zone.
- **Arrays collapse too** — they ride the same well tier; excluding them
  would leave one expanded-only surface type and break the set.

## Risks

- Scroll-jump artifacts in sticky mode → mitigated by the anchoring step;
  iterate live (the falsifier for the mechanic is "reading position visibly
  teleports while scrolling").
- rjsf content unmount on collapse is value-safe (values live in form state,
  not mounted inputs); collapse therefore must NOT change submitted config —
  covered by behavior-parity expectations.
