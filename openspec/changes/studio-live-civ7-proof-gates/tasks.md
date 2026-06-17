## 1. Live Proof Protocol

- [ ] 1.1 Define generated, deployed, tuner, logged, and in-game labels separately.
- [ ] 1.2 Define the `studio-current.js` local/deployed/setup visibility falsifier.
- [ ] 1.3 Define direct-control host, port, state, command, result, request id, and timestamp fields.

## 2. Implementation

- [ ] 2.1 Repair live proof surfaces only where the protocol exposes a defect.
- [ ] 2.2 Keep generated files command-regenerated and named in this phase record before commit.

## 3. Verification

- [ ] 3.1 Run source tests and build gates.
- [ ] 3.2 Record deployed `maps/studio-current.js` identity and markers.
- [ ] 3.3 Record bounded `Scripting.log`, `Modding.log`, `Database.log`, and `UI.log` evidence when used for claims.
- [ ] 3.4 Record in-game setup visibility and created-game readback, or unresolved labels if Civ7 is unavailable.
