## 1. Control Record

- [x] 1.1 Verify the original packet-train OpenSpec changes are archived,
      task-complete, and OpenSpec-valid on the top normalization tree.
- [x] 1.2 Create this follow-on OpenSpec change for residual standardization.
- [x] 1.3 Record implementation evidence and downstream realignment before
      archive.

## 2. Projection And Config Cutovers

- [x] 2.1 Move Hydrology projection evidence to a `map-hydrology` artifact
      owner and delete old Hydrology-owned projection ids.
- [x] 2.2 Remove false `map-hydrology` artifact dependencies that do not
      describe real handoffs.
- [x] 2.3 Migrate `map-morphology` to flat step-id config and reject legacy
      alias keys.

## 3. Truth/Projection Separation

- [x] 3.1 Move mountain ridge/foothill planning out of `map-morphology` and
      into Morphology truth artifacts/steps.
- [x] 3.2 Make `map-morphology/plot-mountains` consume truth masks/intents and
      only project engine terrain/evidence.
- [x] 3.3 Delete unused combined ridge/foothill compensation paths.

## 4. Placement Product Boundaries

- [x] 4.1 Remove natural-wonder fallback stamping from the old placement
      monolith and require the product artifact.
- [x] 4.2 Split remaining placement products into explicit steps: resources,
      starts, discoveries, advanced starts, and final summary.
- [x] 4.3 Delete or retire the old broad placement apply owner after product
      steps own the effects.
- [x] 4.4 Move tests toward recipe/product-boundary evidence and avoid using
      manual step wiring as closure proof for product contracts.

## 5. Shared Surface And Config Ownership

- [x] 5.1 Disposition recipe-root shared artifact/tag surfaces as named
      invariants or move contents to real owners.
- [x] 5.2 Disposition `stages/ecology` and `stages/morphology` artifact
      surfaces as named shared contract owners or move contents to producing
      stages.
- [x] 5.3 Rehome or explicitly classify Narrative config so domain-root config
      remains a thin facade or named invariant owner.

## 6. Guardrails, Docs, And Comments

- [x] 6.1 Add categorical guard/test coverage for any standard that would
      otherwise regress.
- [x] 6.2 Update canonical docs/policies for the final owner tree and proof
      boundaries.
- [x] 6.3 Add useful why/what comments to changed owner surfaces and
      non-obvious policy logic.

## 7. Verification

- [x] 7.1 Run focused changed-area tests.
- [x] 7.2 Run `bun run --cwd mods/mod-swooper-maps check`.
- [x] 7.3 Run `bun run lint:normalization-guardrails -- --self-test`.
- [x] 7.4 Run `bun run lint:normalization-guardrails`.
- [x] 7.5 Run `bun run openspec -- validate normalize-architecture-dx-standardization --strict`.
- [x] 7.6 Run `bun run openspec:validate`.
- [x] 7.7 Run `bun run build`.
- [x] 7.8 Run `bun run deploy:mods`.
- [x] 7.9 Run `git diff --check`.
