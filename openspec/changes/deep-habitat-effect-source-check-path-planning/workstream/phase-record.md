# Phase Record: Source Check Path Planning

## Context

The slow-check investigation showed broad pattern roots shared by many rules.
The previous lazy-AST slice reduced accidental parse work but did not materially
change root structural check wall time, which points to rule/file planning as
the next substrate problem.

## Review Notes

- Exact path coverage already exists on many pattern rules.
- Rules still marked `unresolved-metadata` intentionally remain on broad
  scan-root fallback until their coverage is made exact.
- This slice does not close Grit batching for native `grit check`; it improves
  the owned source-check structural path.
