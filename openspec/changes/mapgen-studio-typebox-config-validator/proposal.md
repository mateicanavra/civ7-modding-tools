## Why

The MapGen Studio design system cannot be attached in claude.ai/design. The
synced component bundle ships **ajv** (react-jsonschema-form's default
validator), which compiles JSON Schema at validate time with `new Function(...)`.
The design sandbox serves components under a strict CSP (`script-src` without
`'unsafe-eval'`), which blocks code generation from strings, so the bundle
throws an `EvalError` at validate/render time. This `new Function` compiler is
the **sole** runtime code-generation site in the bundle (verified: it throws
under `node --disallow-code-generation-from-strings`, the CSP equivalent; the
bundle otherwise module-loads cleanly).

The Studio already depends on **TypeBox** (`typebox@^1.0.80`, a direct
dependency) and already validates recipe configs through it via
`normalizeStrict`. TypeBox's value interpreter (`Check`/`Errors` from
`typebox/value`) validates plain JSON Schema without any code generation, so it
is CSP-safe. Running a second, non-CSP-safe validator (ajv) for the same schemas
is redundant and is exactly what breaks the design integration.

## Authority

- Direct current user decision (2026-06-30 / 2026-07-01): migrate the Studio
  config-authoring form off ajv to a TypeBox-backed rjsf validator **app-wide**,
  gated on ajv parity, to unblock claude.ai/design attach. This is authority
  order item 1 ("Direct current user decisions") in `openspec/config.yaml`.
- This is a MapGen Studio DX / design-sync enablement slice. It is **outside**
  the architecture normalization change train and does not touch, soften, or
  redesign the normalization packet.

## What Changes

- Add a TypeBox-backed custom rjsf `ValidatorType`
  (`typeboxRjsfValidator.ts`) built on `Check`/`Errors` from `typebox/value`.
- Swap the config-authoring form (`SchemaForm.tsx`) from
  `customizeValidator()` (ajv) to the TypeBox validator.
- Import `Form` from its component subpath (`@rjsf/core/lib/components/Form.js`)
  instead of the `@rjsf/core` barrel. The barrel's `index.ts` statically imports
  `getTestRegistry`, which imports `@rjsf/validator-ajv8` (ajv) at top level;
  because neither `@rjsf/core` nor `ajv` sets `sideEffects: false`, bundlers
  cannot tree-shake that unused test-only helper, so the barrel drags ajv's
  `new Function` compiler into every bundle. This edge — not the removed
  validator import — is why ajv survived; the subpath keeps it out for every
  bundler (vite and the design-sync esbuild) with no build-config change.
- Move `@rjsf/validator-ajv8` from `dependencies` to `devDependencies`. App code
  no longer imports it, so it leaves the production / design-sync bundle (the
  CSP fix); it is retained **only** as the differential parity-test oracle.
- Add a committed differential test suite pinning the new validator to ajv
  parity (validity decisions + error attribution) across the JSON Schema
  features that real recipe config schemas use.

## What Does Not Change

- No component, story, template, widget, or form-layout behavior — this is a
  validator swap only.
- Config validity semantics stay at parity with ajv; no validation rule is
  relaxed, skipped, or softened.
- No change to how schemas are produced or normalized (`configBuilders.ts`,
  `schemaPresentation.ts`).
- The TypeBox **compiler** (`TypeCompiler`) is never introduced — it uses
  `new Function` and would reintroduce the defect.

## Affected Owners

- `apps/mapgen-studio/src/features/configOverrides/SchemaForm.tsx`
- `apps/mapgen-studio/src/features/configOverrides/typeboxRjsfValidator.ts` (new)
- `apps/mapgen-studio/src/features/configOverrides/typeboxRjsfValidator.test.ts` (new)
- `apps/mapgen-studio/package.json` (`@rjsf/validator-ajv8` -> devDependencies)

## Verification Gates

- `bunx vitest run --config vitest.config.ts --project mapgen-studio` (differential
  parity suite green: TypeBox validator vs `@rjsf/validator-ajv8` oracle)
- `tsc --noEmit` clean for `apps/mapgen-studio`
- Biome lint clean on touched files
- Rebuilt Studio bundle contains **zero** `new Function`/ajv (CSP-safety proof)
- `bun run openspec -- validate mapgen-studio-typebox-config-validator --strict`
- `git diff --check`

## Stop Conditions

- A real recipe config schema uses a JSON Schema feature the TypeBox validator
  handles differently from ajv in a way that changes form validity.
- Achieving parity would require editing a component, story, or the
  schema-normalization pipeline.
- The rebuilt bundle still contains a `new Function`/eval codegen site after
  the swap.
