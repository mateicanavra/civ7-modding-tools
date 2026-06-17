# Phase Record: Studio Live Civ7 Proof Gates

Status: implemented and verified for the SMR-07 blocker, with proof labels kept
separate.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-07---live-civ7-proof-gates`.

Priority rows: LIVE-01 through LIVE-04, OP-04 live portions, PROOF-01 through PROOF-06, EB-14, EB-15, EB-17.

Priority blocker: `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js` after `preparing-setup`.

## Diagnosis

The blocker reproduced as a process-load boundary. The exact Studio build
command generated local `studio-current` artifacts with request markers, and the
repo-owned deploy API copied the local bundle into the Civ7 Mods target with
matching sha256. Even so, the already-running Civ7 shell did not list
`{swooper-maps}/maps/studio-current.js` after an App UI reload. After a Civ
process restart, the setup-domain and config-db rows were immediately visible,
and a direct-control setup/start probe created an in-game session.

## Implementation Decision

Disposable Run in Game launches materialize transient `studio-current` by
definition. They first use the existing setup visibility path, including
`exit-to-shell` reload, so map restart does not normally mean process restart.
Only a typed `setup-row-unavailable` proof failure with
`reloadBoundary: "process-restart-required"` triggers the Civ process restart
fallback and retry. Durable saved-config launches keep the previous opt-in
restart behavior.

SMR-06 browser execution exposed that macOS process-start is not the same as
Civ7 shell readiness: the intro/cinematic can still be active after Steam launch.
The restart leaf now passively waits for `getCiv7PlayableStatus` App UI probes
to report `inShell === true` before the workflow advances. It does not click or
send coordinate input during restart, because that can open in-game UI such as
the social panel if Civ7 reaches an interactive screen before the click lands.
For acceleration, it attempts to close only active `Cinematic` display-queue
requests through the direct-control DisplayQueueManager atom, and skips that
attempt once the App UI reports `inGame === true`.

Error handling stays in Effect terms. Production dependency, proof, and
materialization failures remain `StudioRuntimeFailure` values produced through
`dependencyUnavailable`, `proofFailed`, and `materializationFailed`.

## Generated Artifact Policy

`mods/mod-swooper-maps/src/maps/generated/studio-current.ts`,
`mods/mod-swooper-maps/mod/maps/studio-current.js`, and the matching deployed
Mods copy were command-regenerated as evidence for request id
`smr07-local-proof-20260617004904`. They are not intended as durable committed
source for this packet. The repo tree was restored to normal non-transient
generated output with `bun run nx run mod-swooper-maps:build --outputStyle=static`
before commit; the deployed Mods copy is live proof state outside git.

## Verification

- `bun run --cwd packages/studio-server test test/contractTypeboxSpine.test.ts`
- `bun run nx run @civ7/studio-server:test --outputStyle=static`
- `bun run --cwd apps/mapgen-studio test test/studioErrors/definedErrorProjection.test.ts`
- `bun run nx run mapgen-studio:test --outputStyle=static`
- `bun run nx run mapgen-studio:build:vite --outputStyle=static`
- `bun run nx run @civ7/studio-server:build --outputStyle=static`
- `bun run nx run mod-swooper-maps:test:studio-run-in-game --outputStyle=static`
- `bun run nx run mapgen-studio:check --outputStyle=static`
