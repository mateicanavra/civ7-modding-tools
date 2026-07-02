# Narrative Burn-Down Draft Sliced Plan

Status: draft execution plan for the narrative liveness and ownership prework
decision.

This plan captures the current intended sequence. It does not execute source
deletion, source migration, `structure.toml`, or Grit enforcement.

## Frame

The objective is to burn down current `domain/narrative/**` source manually
until the remaining work belongs to the generic domain blueprint scope
assertion.

The production/runtime finding is already clear: current
`mods/mod-swooper-maps/src/domain/narrative/**` has no production recipe caller.
It is held by public barrels and tests. Separate Civ7 runtime/control narrative
choice code exists outside MapGen and does not consume this domain source.

## Slice 1: Mechanical Shell Deletion

Remove the empty domain shell and unused wind helper:

- `mods/mod-swooper-maps/src/domain/narrative/ops.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts`

Update barrels:

- remove the `defineDomain` shell, `ops` import, and default export from
  `mods/mod-swooper-maps/src/domain/narrative/index.ts`;
- remove the `wind.ts` wildcard export from
  `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts`.

Proof:

- no remaining imports reference the deleted paths or deleted symbols;
- TypeScript/Habitat checks pass for the changed surface.

Expected result: the empty domain registration shell is gone while story exports
remain available for the next slice.

## Slice 2: Story Network Disposition

Decide the remaining story network as one unit:

- corridors;
- orogeny belts/cache;
- overlays;
- tagging;
- story config/model/types;
- `mods/mod-swooper-maps/test/story/**`;
- public story exports from `domain/narrative/index.ts` and
  `domain/narrative/config.ts`.

Current recommendation: delete the story network instead of porting it. The
network has test coverage but no production/runtime consumer. It represents
legacy story/playability code, not a required source for current map generation.

Proof before execution:

- confirm no production import outside the root barrels consumes story symbols;
- confirm story tests are the only active callers;
- confirm separate runtime/control narrative choice code does not import this
  network.

Expected result: the decision is a direct delete decision unless the next
prework pass finds a concrete production consumer.

## Slice 3: Story Network Deletion

Delete remaining `mods/mod-swooper-maps/src/domain/narrative/**`.

Remove connected test/public surfaces:

- `mods/mod-swooper-maps/test/story/**`;
- narrative export from `mods/mod-swooper-maps/src/domain/index.ts`;
- narrative config export from `mods/mod-swooper-maps/src/domain/config.ts`.

Proof:

- no imports reference `@mapgen/domain/narrative`,
  `@mapgen/domain/narrative/config.js`, or `domain/narrative/**`;
- tests/types/checks pass for the affected package surfaces.

Expected result: the narrative domain source tree is gone.

## Slice 4: Connected Compatibility Cleanup

Remove compatibility surfaces that only existed for the deleted story network
after usage proof confirms they have no remaining consumers:

- `StoryOverlaySnapshot`;
- `StoryOverlayRegistry`;
- `ExtendedMapContext.overlays`;
- `storyEnabled` in `mods/mod-swooper-maps/src/recipes/standard/runtime.ts`;
- dev diagnostic initializers that only set `storyEnabled: true`.

Keep exact collars that belong to other owners:

- placement discovery narrative-system comments and artifacts remain
  placement/adapter-owned;
- hydrology downstream narrative mentions remain hydrology artifact/source
  comments until their owning stage decides wording;
- Civ7 direct-control/control-oRPC/CLI narrative choice code remains runtime
  control authority.

Proof:

- no production or test imports reference removed compatibility types/fields;
- runtime/control narrative choice code remains untouched.

Expected result: MapGen core no longer carries story overlay compatibility state
for deleted narrative-domain code.

## Handoff Point

After Slice 4, there is no `domain/narrative` source tree to migrate through the
domain blueprint scope assertion.

The next closed-structure work proceeds through the generic domain blueprint
domino across the remaining domain roots. Narrative contributes no special
instance rule and no domain-specific carveout.
