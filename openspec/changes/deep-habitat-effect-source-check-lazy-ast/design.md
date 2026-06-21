# Design: Source Check Lazy AST

## Frame

The ordinary Habitat check loop should behave like a repository harness, not a
slow test suite. Its source-check domain owns rule evaluation over repository
files, so file acquisition should expose the data a rule needs without forcing
every possible representation up front.

## Ownership

- `tools/habitat-harness/src/domains/source-check/source-patterns.ts` owns file
  collection and native source-check policy invocation.
- `.habitat/source-check/pattern-rules.mjs` owns generated policy logic and
  remains a read-only generated artifact for this slice.

## Implementation

Change `readSourceFiles` so each TypeScript-like record carries a memoized
`sourceFile` getter. Text and path are still loaded eagerly because every rule
can inspect them cheaply. The TypeScript AST is constructed only when a rule
or helper reads `file.sourceFile`, and then reused for the rest of that file's
rule evaluations.

This keeps the current generated policy contract intact while avoiding AST
creation for Markdown, JSON, and text/path-only checks.

## Risks

- A policy helper that checks property presence rather than reading
  `file.sourceFile` could observe a getter instead of an eager data property.
  Current policy helpers read the property value directly.
- The improvement is bounded by how many selected rules actually need AST for
  the selected files. It reduces accidental work without hiding the larger
  rule-scoping and Grit-batching follow-up.
