# Problem Classification

Date: 2026-06-16

## Untested User Flows

Basic setup loading, Run in Game, retry/restart, operation adoption, event reconnect, autoplay, explore, and browser diagnostics were not all proven. Next packets must start from user scenarios, not from isolated source files.

## Proof Overclaims

Past closure claims allowed tests, build, live unavailable probes, and quiet logs to imply broader product correctness. The new proof model forbids substitution between test, build, generated, deployed, tuner-exercised, logged, in-game observed, Graphite-submitted, and product-proof labels.

## Router-Boundary Mistakes

Expected runtime failures should be declared through effect-oRPC router leaves where applicable. Unexpected defects should remain defects. The next workstream must audit every Studio router leaf rather than extrapolating from one endpoint.

## Operation Lifecycle Classification Gaps

Run in Game may preserve raw promise causes but still project plain background exceptions as `InvalidRequest`. Phase-specific failures need proof across materialization, deploy, restart, playable/setup checks, start game, log proof, exact authorship, and cleanup.

## Browser Typed-Error Projection Gaps

Browser clients are inconsistent: Run in Game preserves defined error code/details, while save/deploy and autoplay appear to flatten declared errors to message-only failures. The next workstream must decide and test the user-visible projection.

## Event-Stream And Restart Adoption Gaps

Event stream errors may leave stale local error state after reconnect. Operation current/recent truth, hello/current replay, daemon identity, and reload adoption need explicit proof.

## Dev-Port And Runtime Process Risk

`bun run dev:mapgen-studio` is Nx orchestration, not plain Vite. It runs the frontend after continuous daemon startup and dependency builds. Current prework probe was blocked by an existing Nx process, so startup proof remains unresolved.

## Generated Artifact Handling

Studio runtime proof touches generated mod outputs. These must be regenerated through scripts and never hand-edited. Dev/build probes may dirty generated surfaces; closure requires distinguishing source changes from generated residue.

## Graphite And Worktree Risk

The current Graphite render shows the Studio stack under unrelated habitat state with a `needs restack` marker, while Git ancestry does not support that as actual parentage. There are also duplicate/detached Studio-related worktrees. The next objective must avoid broad restack/sync/submit until stack ownership is explicit.

## Stale Doc/Code Divergence

Older tuner-session design text may conflict with current `Civ7TunerSession.use` behavior, which preserves original rejection causes. Current code/tests outrank stale design text.

## Live Verification Gaps

FireTuner/Civ7 unavailability blocks direct tuner, fresh-log, runtime readback, and in-game observation labels. It does not block source tests or design, but no later closeout may infer live success from unavailable-path tests.

