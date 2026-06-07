# Expectation And Strategy Ledger

See `references/corpus-and-expectations.md` for the expectation row contract and
the worked non-distribution example. Row 1 is a filled example (an
eligibility-shaped, non-distribution expectation); replace it.

| Corpus row/group | Expected behavior | Condition | Evidence strength | Architecture owner | Strategy/artifact | Local stats gate | Runtime proof | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FEATURE_FLOODPLAIN_* | placed only on flat land adjacent to river; 0 elsewhere | isFlat && adjacentToRiver | high (engine legality) | ecology-features op | floodplain eligibility mask | 0 placements outside legal mask; fill-rate band 0.4–0.7 of eligible river tiles | feature readback via GameplayMap.getFeatureType | proposed |
|  |  |  | high/medium/low/inferred |  |  |  |  | proposed/implemented/blocked |

## Notes

- Physical/ecological/gameplay/surface/readback/effect-matrix baseline:
- Known exceptions:
- Proxy gaps:
- Unassignable or not-applicable rows:
- Review findings:
