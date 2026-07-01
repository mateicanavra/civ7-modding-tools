## 1. Phase Opening

- [x] 1.1 Create worktree/branch off `main`; open this OpenSpec change.
- [x] 1.2 Enumerate the JSON Schema features used by real recipe config schemas
  (the parity scope), and confirm `SchemaForm.tsx` is the only ajv importer.

## 2. Behavior Spec (test-first)

- [x] 2.1 Port the differential parity harness into a committed Vitest suite with
  `@rjsf/validator-ajv8` as the parity oracle.
- [x] 2.2 Cover the real fixture plus every JSON Schema feature the real schemas
  use (type, enum, const, numeric bounds, string length/pattern, array
  minItems/uniqueItems/items, nested objects, required/nested-required, unions).

## 3. Implementation

- [x] 3.1 Implement `typeboxRjsfValidator.ts` as an rjsf v6 `ValidatorType`:
  `isValid` -> `Check`; `validateFormData` -> `Errors` mapped to
  `RJSFValidationError[]` + `errorSchema`; `rawValidation`; optional `reset`.
- [x] 3.2 Reshape errors to ajv/rjsf shape: relocate `required` errors onto the
  missing child field via `params.requiredProperties` -> `missingProperty`; pass
  through `customValidate` and `transformErrors`.
- [x] 3.3 Swap `SchemaForm.tsx` to the new validator; import `Form` from its
  component subpath (bypasses the `@rjsf/core` barrel's `getTestRegistry` -> ajv
  edge); move `@rjsf/validator-ajv8` to `devDependencies`; confirm no other
  barrel importer (`SchemaForm.tsx` was the only one).

## 4. Verification

- [x] 4.1 Run the Vitest parity suite; confirm green (58 assertions, all pass).
- [x] 4.2 `tsc --noEmit` (green via `nx build:vite` -> `check` dependency, with
  workspace deps built) + Biome lint clean on all touched files.
- [x] 4.3 Rebuild the Studio dist; whole app bundle (index + worker) has zero
  `new Function` and zero ajv markers; the config-form component surface
  (SchemaConfigForm) bundles ajv-free with the TypeBox interpreter present.
- [ ] 4.4 `openspec validate mapgen-studio-typebox-config-validator --strict`;
  `git diff --check`.

## 5. Design-Sync Attach (lightweight)

- [x] 5.1 Proven at the bundle level LOCALLY: the DS entry (`ds-entry.tsx`)
  exports `SchemaConfigForm` -> `SchemaForm` (the old `_ds_bundle.js` carried 9
  getTestRegistry/customizeValidator markers, 1 `new Function`, 23 ajv markers).
  `SchemaForm` was the only `@rjsf/core` barrel importer; after the fix the full
  app dist and the isolated config-form surface both bundle 0 `new Function` /
  0 ajv, so the rebuilt DS bundle is necessarily codegen-free.
- [x] 5.2 LIVE re-sync DONE: composed the fix onto the #1992 storybook-shape
  tree (isolated detached worktree), ran the converter (`package-build.mjs`) ->
  regenerated `_ds_bundle.js` (`new Function` 1->0, ajv 23->0, TypeBox present),
  and uploaded the bundle + recompile sentinel to project 531d158d via
  DesignSync (sentinel -> bundle -> sentinel). The live "Civ7 MapGen Studio"
  design system is now ajv-free and ready to attach in claude.ai/design. The
  committed #1992 bundle still carries ajv until this + #1992 merge and a
  routine `resync.mjs` runs.

## 6. Review & Submit

- [x] 6.1 Fanned out 4 adversarial review lanes (parity, code-quality,
  TypeScript, CSP). Confirmed finding: tuple `additionalItems:false` overflow
  diverged from ajv on error attribution/message (isValid agreed). Fixed by
  re-mapping the TypeBox `boolean`/`additionalItems` error to ajv's shape, and
  added `pattern`/`minLength`/tuple parity cases (matrix: 58 -> 74 assertions).
- [ ] 6.2 `gt submit --draft` after confirming parent = `main`.
