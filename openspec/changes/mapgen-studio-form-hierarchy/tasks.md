## 1. rjsf templates

- [ ] 1.1 `rjsfTemplates.tsx`: split `FORM.label` usage — labels take a new
      foreground-tier class; descriptions/help/gs-comments keep the muted tier.
- [ ] 1.2 `rjsfTemplates.tsx`: gate the error region on `props.rawErrors?.length`
      (both the labeled and unlabeled template branches), preserving
      `id="${id}__error"` + `role="alert"` when errors exist.

## 2. Hand-rolled fields

- [ ] 2.1 `src/ui/components/fields/styles.ts` (and any field component that styles
      labels directly): apply the same label/description tier split.

## 3. Verification

- [ ] 3.1 `bun run openspec -- validate mapgen-studio-form-hierarchy --strict`
- [ ] 3.2 tsc + mapgen-studio vitest project green
- [ ] 3.3 Visual on :5173 (dark + light): labels read as anchors; DOM query counts
      zero empty `[role="alert"]`; force an invalid value and confirm the alert
      region renders with the association contract intact.
