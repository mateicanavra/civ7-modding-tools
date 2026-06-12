## 1. Implementation

- [x] 1.1 Codify `FORM` rhythm + well surface classes in `rjsfTemplates.tsx`
      (fieldGap 4 / siblingGap 8 / groupGap 12; well = page-tint + subtle
      border + rounded + p-2).
- [x] 1.2 Object template: depth≥2 groups render as wells (drop `border-l` +
      `pl-*` ladder); depth≥3 adds heading + rhythm only; headings move to the
      eyebrow tier.
- [x] 1.3 Array template: unify onto the well treatment.
- [x] 1.4 Apply rhythm to root/stage content gaps.
- [x] 1.5 Update `rjsfFieldTemplateErrors.test.tsx` assertions if class names
      shifted; add a well/no-indent assertion for a nested group.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-config-surface --strict`
- [x] 2.2 tsc + mapgen-studio vitest green
- [x] 2.3 Visual on :5173, dark AND light: stage card → group well reads as two
      recess steps (squint test shows chunking); no left-rule indents; rhythm
      visibly tiered (field < sibling < group). Screenshot both themes.
