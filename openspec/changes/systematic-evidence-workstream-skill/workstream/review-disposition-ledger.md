# Review Disposition Ledger

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Avoid duplicating `civ7-open-spec-workstream` | P2 | accepted, repaired | Skill now owns corpus/expectation/stats/runtime-proof method and explicitly composes with OpenSpec phase mechanics instead of replacing them. |
| Avoid resource lock-in | P2 | accepted, repaired | Skill hard core uses entities, action surfaces, materialization targets, and effect matrices; references include features, biomes, terrain, brushing, trees, wetlands, wonders, and yields. |
| Closure proof classes must stay separate | P2 | accepted, repaired | `references/evidence-and-proof.md` includes proof classes, closure-state matrix, exact closure language, and stale-record audit. |
| Top-level expectation wording strains brushing/stamping and effect matrices | P2 | accepted, repaired | Added surface-legality, readback, and effect-matrix expectation wording in `SKILL.md`, `references/method-loop.md`, `references/corpus-and-expectations.md`, and `assets/expectation-strategy-ledger.md`. |
| Future-domain examples omitted wetlands, natural wonders, and yield/effect matrices | P2 | accepted, repaired | Added those rows to `references/corpus-and-expectations.md`. |
| Runtime proof asset omitted readback fields | P2 | accepted, repaired | Added readback API/surface, readback coverage, and truth-vs-projection parity fields to `assets/verification-and-runtime-proof.md`. |
| Next packet was stale enough to break resumption | P1 | accepted, repaired | Rewrote next packet to start from the actual remaining work and use `.agents/skills/civ7-systematic-workstream/**`. |
| Stale non-civ7 skill path in OpenSpec records | P2 | accepted, repaired | Repaired proposal write set and skill path to use `.agents/skills/civ7-systematic-workstream/**`; obsolete path mentions are no longer present in live routing records. |
| Runtime closure language omitted deploy/downstack/response/manual-boundary fields | P2 | accepted, repaired | Expanded runtime closure language in `references/evidence-and-proof.md` and closure checklist runtime record fields. |
| Product proof label was underspecified | P2 | accepted, repaired | Added product-proof closure language and a product proof section to `assets/verification-and-runtime-proof.md`. |
| Method reference had 10 sections while SKILL advertised 12 gates | P2 | accepted, repaired | Updated `references/method-loop.md` to use the same 12 gate headings as `SKILL.md`. |
| Workstream record lacked resumption fields | P2 | accepted, repaired | Added last updated, current gate, next gate, blocked by, and stop condition fields to `assets/workstream-record.md`. |
| Quick Start did not route the workstream record location | P2 | accepted, repaired | Added OpenSpec and pre-OpenSpec placement rule in `SKILL.md` Quick Start. |
| Companion-skill section wording encouraged over-loading | P3 | accepted, repaired | Renamed section to `Companion Skill Routing`. |
| Draft skill review by agents still required | P2 | cleared | Peirce, Dewey, Aquinas, Sagan, and Hegel reviewed the draft; no P1 findings remained after accepted P1/P2 repairs. |
