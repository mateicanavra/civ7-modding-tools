# Relief measurements

**Executable authority:** [`families/relief.ts`](../../families/relief.ts)

This family compares authored mountains, hills, foothills, rough land, volcanoes,
and mountain-region interiors with realized Civ7 mountain, hill, flat, and
volcano surfaces. It retains counts, populations, connected-component size and
diameter, volcano provenance, and flat pockets inside orogenic regions.

Connectivity uses the recipe's periodic odd-Q grid. The family does not decide
whether a range is long enough, an interior is open enough, or rough terrain is
too dense; targets own those product judgments.
