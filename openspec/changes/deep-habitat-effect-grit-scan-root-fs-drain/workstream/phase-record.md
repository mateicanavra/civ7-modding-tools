# Workstream Phase Record: Grit Scan Root Filesystem Drain

## Context

Fresh check-duration investigation identified `grit-adapter.test.ts` as a
remaining suite where policy tests still touched live host state. The scan-root
validation test classified missing, protected, generated, approved, and docs
roots by probing the current checkout.

## Decision

Make path existence an explicit input to the Grit scan-root decision while
keeping `existsSync` as the live default. This moves the unit fixture to an
owned adapter policy seam without changing command execution.

## Result

The scan-root validation fixture now supplies deterministic existence facts.
The focused Grit adapter suite passes, with the actual test body work under
200ms on warm runs.
