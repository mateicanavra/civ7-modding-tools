---
system: mapgen
component: build-tooling
concern: typebox
---

# ADR-002 — Shim TypeBox Format Registry for Civ7 V8 Compatibility

- **Status:** Accepted
- **Date:** 2025-12-11

## Context

- Civ7’s embedded V8 rejects Unicode property escapes (e.g., `\p{L}`) in regex literals.
- TypeBox’s built-in format registry (`typebox/format`) ships regexes using Unicode properties, notably `idn-email`.
- After switching validation from `typebox/compile` to `typebox/value`, the format registry began loading and its `idn-email` regex caused runtime parse failures inside the bundled mod (see chunk `IdnEmail`).
- Current domain/step config schemas do not declare any `format:` keywords, so the built-in format checks are unused.

## Decision

- `@civ7/adapter/map-script-build` owns final map-script compatibility.
- Its esbuild plugin provides a minimal, regex-free `typebox/format` registry and
  replaces only TypeBox's Unicode identifier-regex declaration in the guard
  emitter. The edit fails closed if a TypeBox upgrade changes that declaration.
- Both the shipped Swooper build and Studio run-manifest bundler consume this
  adapter surface. MapGen Core remains environment-neutral and keeps TypeBox
  external for the final map bundler to adapt.
- Do not register any default formats in the shim; unregistered formats pass by default. Consequence: TypeBox built-in format validation is disabled unless callers explicitly register safe alternatives.

## Consequences

- **Pros:** Civ7 no longer sees Unicode-property regex literals; avoids runtime syntax errors while retaining schema-based validation for types and ranges.
- **Cons:** Built-in TypeBox format checks (e.g., `email`, `uri`, `uuid`, `idn-email`) are no-ops unless we provide safe replacements. If we add `format:` keywords in the future, we must register compatible validators manually.
- **Maintenance:** A TypeBox internal-path or emitter change fails the adapter
  plugin explicitly. Update the one adapter owner rather than copying an
  upstream private module or adding aliases in consumers.

## Implementation Notes

- Build support: `@civ7/adapter/map-script-build`.
- The same surface owns the pre-evaluation `TextEncoder` banner required before
  TypeBox initializes in Civ7's embedded V8.
- Final-bundle tests cover both shipped maps and the generated Studio-run map.
- No changes to the config schema surfaces or validation API were needed.
