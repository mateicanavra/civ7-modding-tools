## Context

Pass-2 form hierarchy: measured in the live app, rjsf labels and descriptions
were both 11px `text-muted-foreground` (identical color), and 40 empty
`role="alert"` regions were mounted on a pristine form.

## Decisions

### 1. Tier split is color/weight only

`FORM.fieldLabel = text-foreground` is a new entry beside the muted prose tier;
labels keep `text-data font-medium` (no size change). Density is untouched — the
fix is contrast hierarchy, per the Pass-2 amendment in
`.interface-design/system.md`.

### 2. Gate alerts on `rawErrors`, render `errors`

rjsf's `errors` prop is an always-truthy ReactElement; `rawErrors` is the actual
string list. The template now mounts the live region only when
`rawErrors.length > 0` and still renders the richer `errors` element inside it.
The `id="${id}__error"` association contract from `mapgen-studio-a11y-fixes` is
unchanged — widgets already gate `aria-describedby`/`aria-invalid` on
`rawErrors`, so the id appears exactly when the region exists.

### 3. "Hand-rolled field set" resolved as FieldRow-only (verified)

The proposal scoped a matching split for `src/ui/components/fields/styles.ts` —
that file no longer exists: the legacy field set was deleted in the theming
slices and only the layout-only `FieldRow` wrapper remains, which carries no
label styling. No second edit site exists; the spec's "hand-rolled fields match"
scenario is satisfied by the absence of any other label styler (eyebrow labels in
the chrome are a deliberate different pattern, not field labels).

### 4. Proof shape

The form has no live validation (no `liveValidate`, no submit button), so the
error path cannot be forced from the running UI. Proof is a unit test
(`test/config/rjsfFieldTemplateErrors.test.tsx`) rendering the template both
ways, plus a live DOM count of `[role="alert"]` (0 on pristine form, was 40).
