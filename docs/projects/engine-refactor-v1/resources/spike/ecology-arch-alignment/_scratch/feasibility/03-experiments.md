# Experiments (Feasibility)

Goal: run only the minimal diagnostics needed to reduce uncertainty around “hard seams”.

## Baseline test gate

Attempted:
- `bun --cwd mods/mod-swooper-maps test test/ecology`

Result:
- Initially failed due to missing built workspace deps (`Cannot find module '@civ7/adapter'`, `Cannot find module '@swooper/mapgen-core/authoring'`).

Resolution:
- Build the workspace deps that export `dist/*`:
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`

Re-run:
- `bun --cwd mods/mod-swooper-maps test test/ecology`

Final status:
- Pass (42 tests across 16 files).

Interpretation:
- This is a build-order/workspace-exports requirement, not an Ecology behavior regression.

Next actions:
- Record (in canonical docs) the required baseline command sequence for Phase 3 parity gates:
  - Use the repo root `test:ci` script as the default canonical invocation when possible:
    - `bun run test:ci`
