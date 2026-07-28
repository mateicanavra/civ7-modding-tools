# Geography measurements

**Executable authority:** [`families/geography.ts`](../../families/geography.ts)

This family separates authored land and lake intent from the realized Civ7
surface. It measures total tiles; planned and realized land/water; coast and deep
ocean; continental shelf beyond shoreline-adjacent water; planned and projected
lakes; lake component size and diameter; single-tile basins; and projection,
water-state, and final classification drift.

All masks are admitted as binary evidence. Counts retain their populations, and
component facts use periodic odd-Q grid connectivity. No land-share, lake-share,
or deep-ocean threshold is embedded here; those belong to targets.
