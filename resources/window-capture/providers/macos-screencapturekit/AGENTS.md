# macOS ScreenCaptureKit Window Capture Provider

## Role

- Acquire and release one ready ScreenCaptureKit-backed capture capability.
- Own helper compilation, child-process supervision, atomic PNG publication,
  configured managed-destination retention, and provider error translation.

## Boundary

- `index.ts` is the only consumer face.
- Helper source, protocol parsing, process supervision, and capture mechanics stay private.
- This provider never captures a display, activates an application, or invents stale-frame fallback.

## Proof

- `test/semantics/` owns configuration, helper protocol, PNG, cache, and retention meaning.
- `test/execution/` owns interruption, release, child termination, and atomic publication.
- `test/collaboration/` owns opt-in proof against a caller-selected real window and destination.
