# Authored Wet River Continuity

**Goal:** declare the existing physical water transitions to Civ without
changing terrain, lake footprints, discharge or dry river classification.
Continues [coherence completion](coherence-completion.md), domino C2.

## Qualified Mechanism

The paired singleton A/B experiment now has a fresh B2 repeat and a restored
no-write A2 control. A/A2 retain the flared, capped-looking outlet; B/B2 show a
narrow continuous join. Independent visual review agrees. All 6,996 intended
and observed heights, lake masks, 656 dry writes and native dry classes hold.
Some neighboring river bends also change consistently with the intervention;
do not describe it as changing only two local meshes.

The body-42 outlet-only C arm likewise corrects the lower-left outlet while
leaving the upper-left inlet shape unchanged. Its complete native elevation,
lake and dry-class arrays match the control. The connected wet-spine D arm has
the same visible geometry and no additional benefit. Independent review finds
no obvious dry gap or transverse bank at either NAV junction in C or D.
These are rendering claims, not ship movement or a native directed-edge getter.

## Selected Ownership

Extend the existing pure recipe policy `authored-river-projection.ts`.
`project-river-network` owns physical dry classification and must not become a
native serialization policy. `plot-rivers` composes and dispatches; the Civ
adapter stays mechanical. No new operation computes another drainage graph.

Keep current dry `writes`, masks, source counts and classification invariants
unchanged. Publish separate `wetTransitionWrites` with source, receiver,
direction, body identity and role. Coverage metrics must inspect that explicit
array rather than pretending wet sources are dry river tiles.

## Admission

Start with the qualified navigable-outlet regime: certified positive body
outflow, fully accepted physical wet footprint, recorded wet outlet, and a
classified dry NAV receiver. Use the existing parity/wrap-aware direction
lowering. No coordinate exceptions, minimum lake sizes, height carving,
cliff suppression or automatic class promotion.

Choose outlet-only. D provides no reason to project internal receiver paths,
so do not add path traversal, deduplication or extra validation machinery for
an unneeded interior policy. Do not write every lake cell.

Original marine cells are never wet-transition sources. Accepted inland COAST
may be native `isLake=false`; original-land identity and accepted physical body
membership distinguish it from marine water. Qualify that witness explicitly
in the generalized native run rather than silently filtering it out.

The retained Huge/1018 plan contains 37 NAV outlets, 13 MINOR outlets and five
unclassified dry outlets. NAV outlet-only yields 37 wet writes; the rejected
inlet-supported path union would yield 64. MINOR and unclassified outlets are not silently promoted.
Direct wet-body or marine receivers are absent from this cohort and remain
outside this bounded policy until separately qualified.

## Verification

Preflight the entire dry and wet plan before any native write. Preserve one
finalizer, existing cache schedule and lake-footprint assertion. Wet sources
must remain accepted water; require neither wet NAV terrain nor shared native
river membership.

Test singleton and multi-cell bodies, parities/wrap,
incomplete acceptance, zero outflow, malformed outlet edges, original marine
exclusion, and dry-source identity. Run the portable held cohorts and the
owning check/test/build graph. Capture fresh production singleton, large-lake
and native-nonlake COAST witnesses before accepting the generalization.

Exploration-era normally produced Cog qualification remains a separate gameplay
test. Do not block a demonstrated visual repair on the previous invalid
debug-Galley oracle, and do not call visual success navigability.

## Implementation And Held Cohorts

The existing lowerer now publishes outlet-only `wetTransitionWrites` alongside
the unchanged dry plan. The step checks the complete accepted native water/COAST
footprint before dispatch, appends wet declarations after the exact ordered dry
writes, and retains one finalizer and the existing maintenance schedule. There
is no interior lake traversal, terrain carving or new configuration strategy.
The shared mock records wet intent without replacing water with dry NAV terrain;
this is a test-boundary correction, not an emulation of native shoreline meshes.

Independent source review found no blocking correctness issues. The owning
adapter/definition/app check, test and build graph passed all 50 tasks (21 cache
hits), including 1,065 tests. Focused regression coverage includes complete-body
preflight, rejected partial footprints, parity/wrap, native `isLake=false`, and
zero writes on failed admission.

| Held cohort | Unchanged dry writes | Wet NAV outlets | Uncovered eligible outlets |
| --- | ---: | ---: | ---: |
| Huge / 1018 | 656 | 37 | 0 |
| Standard / 1018 | 435 | 20 | 0 |
| Huge / 42 | 618 | 40 | 0 |

All three pass 57/57 integrity targets. Their 13 physical hashes, complete
generated arrays and body records, exact ordered dry writes, configuration and
scenario identity match the retained pre-change controls. Only explicit wet
write/coverage measurements change. Evidence is retained at the canonical
user-data atlas under `wet-continuity-production/verification-summary.json`;
see [local viewers](../../process/LOCAL-VIEWERS.md) for the discoverable root.

## Native Production Outcome

Fresh normal Huge Earthlike/1018 completed with the built and installed script
both SHA256 `4c5a16f76f53d006d64cb07d29fcd24d5c41ba322b8c82ee94a1b13b309d705f`.
The public whole-map read contains all 6,996 plots. Independent comparison finds
zero elevation, terrain, water, lake, river-type or river-membership differences
against the previous normal map, including all 656 classified dry sources.
All 203 accepted wet cells remain COAST/water (155 native lakes, 48 non-lakes).

Fresh production screenshots retain the corrected singleton and five-tile
lake outlets. Accepted non-lake bodies 63/67/69 preserve all 17/16/15 wet cells.
However, the cliff-ringed body69 still shows a discontinuous shore/channel
transition. Do not call the entire water-transition family solved: the wet
declaration repair is accepted, while that height/cliff regime remains the next
bounded discriminator. More interior lake writes are not justified by this
result. The full-map physical evolution and density work also remain open.

The phone viewer retains six production captures, paired experimental controls,
the normal-map live verification and independent full-map comparison under
`native-wet-outlet-ab/`. Naval movement remains a separate claim. A normally
granted Exploration Cog is an appropriate control as well as a produced one:
shipped `TRAIT_MOD_FREE_SHIP` grants it after Advanced Start card effects;
there is no need to impose a 130-production delay solely to avoid debug spawning.
