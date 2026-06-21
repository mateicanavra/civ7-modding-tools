# Design: Vendor Providers

## Provider Set

```text
tools/habitat-harness/src/providers/
  command/
  fs/
  clock/
  reporter/
  git/
  grit/
  biome/
  nx/
  husky/
  workspace-tools/
```

## Provider Responsibilities

- Command: process execution, env redaction, cwd, bounded stdout/stderr, exit
  state, interruption, duration, and fake command observations.
- FS/clock/reporter: live and fake resource providers used by domains and
  other providers.
- Git: status, staged paths, name-status parsing, merge-base, show, add,
  diff, cleanliness, Graphite parent evidence where consumed.
- Grit: check/apply/test command construction, scan roots, cache policy,
  output parser, projection, and failure tags.
- Biome: format/check/ci command families, file-set write policy,
  safe/unsafe distinction, reporter choice, failure tags.
- Nx: project graph, target existence, affected scope, plugin inferred target
  metadata, generator/migration host facts, cache/target observations.
- Husky: hook name and delegator context only.
- Workspace tools: Habitat logical tool names mapped to provider-owned command
  families; no library-local `Effect.runSync`.

## Provider Non-Claims

- Grit provider does not own baseline shrink-only policy.
- Biome provider does not prove semantic safety for Habitat/Grit transforms.
- Nx provider does not prove unchanged architecture through affected-only
  scope.
- Husky provider does not own staged state or CI proof.
- No provider imports `src/domains/**` to make feature decisions. Providers
  accept request data and return typed provider data or provider errors.

## Shared Contract

Every provider command SHALL use `CommandRunner` and return typed provider data
or provider errors. Domain services consume provider data and decide Habitat
outcomes.

Vendor-providers creates provider contracts, fake/live Layers, and pure
command/output parsing only. It does not drain `src/substrate/providers/grit/**` and does
not own apply/write transaction policy.
