# Change: Habitat Location-Independent Rule Manifests

## Why

The previous packet normalization and derived-runner slice removed some
duplicated execution metadata, but it left a larger dependency in place:
Habitat still treats the current `.habitat/<niche>/blueprints/<blueprint>/<category>/<kind>/<packet>/`
path as the source of rule identity and execution shape.

That is now working against the next authority-tree move. Before rules can be
reorganized into better blueprints, capabilities, niches, or other future
ontology surfaces, Habitat must be able to inventory and execute a rule from
the manifest itself.

The next domino is therefore not another tree cleanup. It is a contract change:
`rule.json` becomes the explicit rule manifest. Habitat discovers all manifests
under `.habitat`, reads their declared identity, reads their current placement,
reads their explicit runner file references, validates those references, and
then builds the inventory.

## What Changes

- `rule.json` becomes the canonical rule manifest for live Habitat rules.
- Rule identity comes from `rule.json.id`, not the directory name.
- Rule title comes from `rule.json.title`, not title-casing the directory name.
- Current rule belonging comes from `rule.json.placement`.
- `placement` is inventory metadata only: true for now, expected to change when
  the later ontology migration has a better authority surface, and not an
  admission model.
- Runner execution files are explicit in `rule.json.runner`, not inferred from
  sibling files.
- Habitat discovers live rules by finding `.habitat/**/rule.json` and parsing
  manifests.
- Duplicate manifest ids fail before execution.
- Missing referenced runner files fail before execution.
- Baseline, artifact routing, Nx, hooks, reports, generators, and tests consume
  manifest facts rather than packet-path grammar.

## What Does Not Change

- This change does not design blueprint, capability, niche, instance, or
  admission ontology.
- This change does not rename or redesign `pathCoverage` or `scanRoots`.
- This change does not derive scan coverage from admitted authority.
- This change does not require runner files to stop being siblings; it only
  removes sibling-ness as the authority source.
- This change does not remove the current physical tree by itself.
- This change does not claim future `placement` shape is permanent.
- This change does not preserve a broad compatibility lane for old path-derived
  identity or sibling-derived execution.

## Product Scenario

An agent can move a Habitat rule manifest from one `.habitat` location to
another while keeping the same `id`, `title`, `placement`, and `runner` file
references. Habitat still inventories the same rule, selects it by id, reports
the same title/message, routes it through the same runner, and uses the same
baseline relation.

The path may remain useful for repository organization, review, and current
tree readability. It is no longer the hidden database key.

## Affected Owners

- Manifest contract: `tools/habitat/src/service/model/rules/dto/registry.schema.ts`.
- Registry loading: `tools/habitat/src/service/model/rules/repositories/registry.repository.ts`.
- Nx registry loading: `tools/habitat/src/providers/nx/rule-registry-loader.ts`.
- Packet-path derivation: `tools/habitat/src/service/model/rules/policy/packet-derivation.policy.ts`.
- Baseline rule-id and baseline-path resolution:
  `tools/habitat/src/service/model/baseline/operations.policy.ts`,
  `tools/habitat/src/resources/artifact-paths.ts`.
- Habitat artifact routing:
  `tools/habitat/src/service/model/rules/policy/artifact-paths.policy.ts`.
- Nx target inputs: `tools/habitat/src/nx-plugin.ts`.
- Authoring/generator surfaces under `tools/habitat/src/generators/**`.
- Active `.habitat/**/rule.json` corpus.
- Adjacent tests under `tools/habitat/test/**`.
- Active authority docs only where they still describe path-derived identity or
  sibling-derived runner inference as current behavior.

## Requires

- The completed packet filename normalization and derived-runner branch as the
  current source evidence.
- Current user decision that `rule.json` should become the location-independent
  rule inventory contract and should not encode future admission.
- Fresh characterization of all 124 live manifests before implementation cuts
  path or sibling inference.

## Enables

- Later movement of rules into better blueprints, capabilities, niches, or other
  ontology locations without changing rule identity or behavior.
- A read-only classification/inventory view that starts from manifest facts
  instead of reverse-engineering packet grammar.
- Later pruning of transitional path-placement records once the future
  ontology supplies better authority objects.

## Forbidden Owners

- No future admission semantics in `rule.json`.
- No new per-packet classification file to replace path-derived facts.
- No second manifest or sidecar registry that duplicates `rule.json`.
- No path parser that remains required for live identity.
- No sibling scan that remains required for live runner derivation.
- No generator that creates a manifest whose identity only works in one packet
  path grammar.

## Stop Conditions

- A live manifest cannot carry enough information to identify, place, and run a
  rule without re-deriving identity or execution from the packet path.
- The implementation needs an equally broad replacement discriminator outside
  `rule.json`.
- `placement` starts functioning as future admission authority.
- Baseline comparison cannot be made location-independent without losing
  shrink/growth safety.
- Nx project inference still needs a parallel rule loader after the service
  registry loader is corrected.
- A compatibility fallback silently accepts old manifest shape or path-derived
  identity after closure.

## Verification

- `bun run openspec -- validate habitat-location-independent-rule-manifests --strict`
- `bun run openspec:validate`
- `git diff --check`
- Focused registry, baseline, hook, Nx, Grit, Habitat structure/script,
  file-layer, generator, and artifact-routing tests.
- Runtime proof:
  - `bun habitat check --runner grit --json`
  - `bun habitat check --runner habitat --json`
  - `bun habitat check --runner nx --json`
  - `bun habitat check --json`
- Closure scans:
  - no required use of `packetLocationFromArtifactPath` for live rule identity;
- no required `isPacketRulePath` filter for live discovery;
- no live code path deriving rule id from `/blueprints/.../<packet>/rule.json`;
- no sibling role scan required to derive `runner`;
- no `rule.json` missing `id`, `title`, `placement`, or `runner`;
- no referenced runner or manifest-declared rule artifact file missing.
