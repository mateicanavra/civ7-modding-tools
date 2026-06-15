# D7 Downstream Realignment Ledger

Status: packet downstream realignment accepted; implementation evidence pending
Date: 2026-06-14; accounting update 2026-06-15

| Downstream surface | D7 impact | Required disposition |
| --- | --- | --- |
| D8 EventHub | Consumes selected `.effect()` + `eventIterator(...)` bridge. | D8 must implement production EventHub/watch through the selected bridge and must not reopen `.handler()` or alternate transport. |
| D8 client subscription | Consumes `experimental_liveOptions` and explicit nonzero retry. | D8 must test retry on the actual watch path, not only helper construction. |
| D9 operations push | Uses the same watch stream for `operation` events. | D9 must not reintroduce polling as freshness authority or add an operation-specific stream. |
| D10 live-game watch | Uses the same watch stream for `live-game` events. | D10 must not add browser timers or a live-game-specific stream when publishing live-game truth. |
| D11 dev runner | Must preserve `/rpc` stream passthrough when simplifying dev orchestration. | Dev runner changes must keep the Vite/daemon stream guard green or replace it with a stronger proof. |
| D12 game-door invariant | Stream payloads remain public DTOs only. | D12 verifies event payloads expose no raw direct-control/session/script fields. |
| S3.0 proof fixtures | Historical proof scaffolding. | D8/D9 promote equivalent assertions into production tests or delete proof-only fixtures with recorded evidence. |
| Historical S3 vocabulary in D8/D9 packets | Existing downstream packets still carry S3.1/S3.2 naming and older gate text. | D8 and D9 packet repair must translate those changes into D8/D9 packet-train vocabulary before acceptance. |
