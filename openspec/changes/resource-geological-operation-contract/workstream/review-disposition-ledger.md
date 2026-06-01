# Review Disposition Ledger

| Finding | Severity | Disposition | Notes |
| --- | --- | --- | --- |
| Keep geological resources as one symbolic group op | P2 | accepted | The expectation artifact already owns one geological group with per-resource rows; no separate consumed/published artifact boundary exists yet. |
| Preserve the four blocked active-zero rows | P1 | accepted, repaired | Tests cover distant-lands gold, distant-lands silver, lapis lazuli, and nickel as visible blocked rows with zero expected ranges. |
| Guard against generic proxy broadening | P1 | accepted, repaired | Tests preserve strict geological signal fields and reject generic forest/wetland or tropical broadening for narrow rows. |
| Add missing geological tests | P1 | accepted, repaired | Added focused operation contract tests before package and OpenSpec validation. |
| Companion masks acted as standalone source eligibility | P2 | accepted, repaired | Removed standalone alluvial jade, orogenic marble, hill-only iron/limestone, wet-alluvial niter, and broad carbonate ruby eligibility; added focused regression checks. |
| Watcher note would remain stale after terrestrial repair | P2 | accepted, repaired | Added the repaired-in-current-slice disposition while preserving the final FireTuner control boundary. |
