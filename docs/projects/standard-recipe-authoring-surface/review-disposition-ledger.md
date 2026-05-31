# Review Disposition Ledger

## 2026-05-31: Corpus And Taxonomy Slice

| reviewer | priority | finding | disposition |
| --- | --- | --- | --- |
| taxonomy/OpenSpec peer | P1 | Migration and Studio proof were sequenced too late as a final shared slice. | Accepted. Project and OpenSpec now require shipped config/preset migration, generated artifact updates, Studio/default/schema proof, and unknown-key tests in the same behavior slice that changes the surface. Final shared slice is guard hardening only. |
| taxonomy/OpenSpec peer | P2 | Flat shape language made `{ knobs?, [publicKey]?: publicConfig }` sound like the default shape. | Accepted. Docs/spec now distinguish default `{ knobs?, [stepId]?: stepConfig }` from justified public+compile transforms with recorded public/internal keys and reason. |
| taxonomy/OpenSpec peer | P2 | `internal-as-public transitional surface` was used without acceptance criteria. | Accepted. Taxonomy/spec now define accepted internal-as-public low-level surfaces and require gameplay/execution meaning, docs, numeric bounds, and no private runtime/projection plumbing. |
| taxonomy/OpenSpec peer | P2 | Deferral language was weaker than the proof posture. | Accepted. Deferral now requires accepted owner, authority reference, trigger, and explicit non-claim of behavior proof. |
| corpus peer | P1 | Strategy coverage collapsed multi-strategy op config leaves onto duplicate paths. | Accepted. Ledger paths now include `strategies.<strategy>.config.*`; duplicate field-path check reports zero duplicates. |
| corpus peer | P1 | Studio focus paths were not enumerated. | Accepted. Ledger now emits `focusRows` for every standard step and summary output includes a Studio focus path table. |
| corpus peer | P2 | Generated artifact coverage omitted dist schema/default/config artifacts. | Accepted. Consumer refs now include standard schema/default/preset, standard artifacts, and standard map-config dist outputs. |
| corpus peer | P2 | Runtime read-site coverage was too narrow. | Accepted. Runtime refs now include core recipe compile/run, standard runtime, Studio runtime recipe registry, Studio worker compile path, and SDK createMap. |
| corpus peer | P2 | Array item schemas were omitted from field coverage. | Accepted. Schema flattening now traverses `items`, including array item object properties. |
| corpus peer | P3 | Step handoff dependencies were not represented. | Accepted. Step rows now include phase, requires/provides tags, and artifact requires/provides. |
