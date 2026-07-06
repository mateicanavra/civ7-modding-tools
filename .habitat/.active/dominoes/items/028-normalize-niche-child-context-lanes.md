# Domino 028: Normalize Niche Child Context Lanes

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

Concrete domain contexts now live as child niches under `.habitat/civ7/mapgen/domains/`: `foundation/rules`, `foundation/_remainder`, `morphology/_remainder`, and `ecology/rules`. The move removes context directories from under `rules/` or root `_remainder/` without changing rule identity or behavior.
