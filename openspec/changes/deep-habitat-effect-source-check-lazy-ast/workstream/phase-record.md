# Phase Record: Source Check Lazy AST

## Context

This slice follows the slow-check investigation. Root `check` now routes to
Habitat structural checks instead of broad package tests; this slice tightens
the source-check substrate used by that structural path.

## Review Notes

- The generated source-check policy currently reads `file.sourceFile` directly
  in AST helpers.
- Markdown and JSON checks should continue to work from `path` and `text`
  without paying TypeScript parse cost.
- This does not close the larger follow-up around Grit pattern batching and
  scan-root scoping.
