## Context

Pass-2 reframe (constraint relaxation): chrome geometry is redesigned; control
density and behavior parity are untouched. The three observed defects share one
root — geometry encoded in stale constants/classes that nothing reconciles.

## Decisions

### 1. Constants as authority, applied via inline style

Tailwind cannot interpolate `w-[${LAYOUT.PANEL_WIDTH}px]` (JIT sees no literal),
so the panels apply widths with `style={{ width: LAYOUT.PANEL_WIDTH }}`. This is
the one sanctioned use of inline style here: it makes `layout.ts` the single
place geometry lives. The arbitrary-value classes (`w-[280px]`, `w-[260px]`) are
deleted rather than updated, so the next geometry change is a one-line constant
edit.

### 2. Kill the reserve, keep the observer

`minHeight: HEADER_HEIGHT` predates the ResizeObserver pipeline and now only
wastes ~56px. The observer remains the sole authority; `LAYOUT.HEADER_HEIGHT`
shrinks to the honest initial-render estimate (48) used as the `useState` seed in
`StudioShell` before the first measurement lands. Wrap behavior (header growing on
narrow viewports) is unchanged because measurement, not the constant, drives
`panelTop`.

### 3. Docks get a `bottom`, panels get `max-h-full`

`LeftDock`/`RightDock` keep owning positioning (their documented single
responsibility) and gain `bottom: FOOTER_HEIGHT + 2×SPACING`. Panels switch to
`max-h-full` so they shrink-to-fit short content but can never escape the column.
This replaces the recipe panel's `calc(100vh-180px)` (wrong whenever the header
wraps) and gives the explore panel its first overflow constraint.

### 4. Fade affordance inside the scroll container

A `pointer-events-none sticky bottom-0` gradient (`bg-gradient-to-t from-card`)
inside the scrollable body. Sticky-in-scroll means it disappears naturally at the
end of content (nothing below it to overlay) without any scroll-position JS.

## Risks

- The explore panel previously had unbounded height; constraining it could clip
  long data-layer lists behind a scrollbar. That is the intended behavior (scroll
  beats footer underlap); verified visually.
- `HEADER_HEIGHT` is exported from `AppHeader.tsx`; consumers checked (only
  `StudioShell` seed + the dropped `minHeight`).
