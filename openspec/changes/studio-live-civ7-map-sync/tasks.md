## 1. Endpoints

- [x] 1.1 Add read-only live status endpoint.
- [x] 1.2 Add bounded snapshot endpoint for plot/grid overlays.
- [x] 1.3 Add bounded entities endpoint for players/units/cities.
- [x] 1.4 Add bounded GameInfo dictionary endpoint.

## 2. Client Runtime Model

- [x] 2.1 Add live runtime types and polling hook.
- [ ] 2.2 Add turn/hash snapshot keying, backoff, and cancellation.
- [x] 2.3 Keep runtime state separate from `pipelineConfig`.

## 3. UI

- [x] 3.1 Add compact Live panel.
- [x] 3.2 Add minimal runtime overlay/status affordances.
- [ ] 3.3 Add explicit suggestion records if any runtime-to-config translation
  is exposed.

## 4. Verification

- [x] 4.1 Run Studio build/check gates.
- [x] 4.2 Record live sync proof or LSQ blocker in the ledger.
