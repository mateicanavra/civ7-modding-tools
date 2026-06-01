# Downstream Realignment Ledger

| Assumption | Downstream Owner | Disposition |
|---|---|---|
| Future resource operations can consume a typed expectation artifact. | Resource operation slices | Implemented as `artifact:resources.earthlikeExpectations`; next slices can design per-group ops against row contracts. |
| Runtime numeric id proof remains separate. | Runtime proof slice | Preserved; expectation rows carry static symbols/slots only and runtime id status is unverified. |
| Hard count gates require telemetry. | Stats and operation slices | Preserved in row `statsProof` text and parent OpenSpec; this slice does not add closure gates. |
