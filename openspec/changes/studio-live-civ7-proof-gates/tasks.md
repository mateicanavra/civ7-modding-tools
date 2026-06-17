## 1. Live Proof Protocol

- [x] 1.1 Define generated, deployed, tuner, logged, and in-game labels separately.
- [x] 1.2 Define the `studio-current.js` local/deployed/setup visibility falsifier.
- [x] 1.3 Define direct-control host, port, state, command, result, request id, and timestamp fields.

## 2. Implementation

- [x] 2.1 Repair live proof surfaces only where the protocol exposes a defect.
- [x] 2.2 Keep generated files command-regenerated and named in this phase record before commit.

## 3. Verification

- [x] 3.1 Run source tests and build gates.
- [x] 3.2 Record deployed `maps/studio-current.js` identity and markers.
- [x] 3.3 Record bounded `Scripting.log`, `Modding.log`, `Database.log`, and `UI.log` evidence when used for claims.
- [x] 3.4 Record in-game setup visibility and created-game readback, or unresolved labels if Civ7 is unavailable.
