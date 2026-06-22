# Habitat Authority Contract

Status: active authority frame

## What This Establishes

`.habitat` is the only durable repository-local source of truth for structural
enforcement intent. Other files may execute, bridge, cache, generate, or test
that intent, but they do not define it independently.

The immediate goal is not to move executables or tool dispatch into `.habitat`.
The goal is to make every authored enforcement policy trace back to Habitat
artifacts, while execution mechanics stay in Habitat Toolkit source.

## Already True

- Rule identity lives under `rules/<rule-id>/rule.json`.
- Owner roots live in `rules/index.json`.
- Baselines live under `baselines/*.json`.
- Authored check patterns live under `patterns/checks/*.md`.
- Authored apply patterns live under `patterns/apply/*.md`.
- CI and hooks already delegate into root commands that can route through
  Habitat and Nx.

## Still Not True

- Many registered source rules still use `ownerTool: "source-check"` even when
  an authored Markdown pattern exists under `patterns/checks`.
- Some command-backed rules point directly at root `scripts/lint/*` files.
- Structural tests live in package `test/` trees without a Habitat rule identity
  or explicit decision that they are product tests rather than structure rules.
- `.grit/grit.yaml` is still a bridge, not an authority surface; it must point
  at Habitat-authored patterns rather than duplicate them.
- Habitat source still contains executable enforcement implementation details
  that must be classified as provider/runtime/tooling code, not authored policy.

## Authority Rules

1. A structural rule is admitted only by a `rules/<rule-id>/rule.json` record.
2. A source-pattern rule is authored in `patterns/checks/*.md` or
   `patterns/apply/*.md`.
3. A baseline is accepted only by `baselines/<rule-id>.json`.
4. Tool dispatch, provider selection, command construction, and result
   normalization are Habitat Toolkit implementation details.
5. External tool configs such as `biome.json`, `nx.json`,
   `eslint.boundaries.config.mjs`, `.grit/grit.yaml`, `.husky/*`, and
   `.github/workflows/*` are invocation or bridge layers. They remain in their
   conventional locations, but their structural meaning must be recoverable from
   `.habitat`.
6. No new loose lint, validation, structural-check, or pattern script may be
   introduced as authored policy without a Habitat rule identity. If it is
   Toolkit execution machinery, it belongs in Toolkit source and must not be
   represented as repo-authored Habitat policy.

## Directory Ownership

| Path | Owns | Does Not Own |
| --- | --- | --- |
| `rules/index.json` | Rule registry root metadata and owner roots. | Per-rule behavior. |
| `rules/<rule-id>/rule.json` | Rule identity, owner tool, detect command, severity lane, baseline link, pattern link. | Pattern source or command implementation. |
| `patterns/checks/*.md` | Positive check pattern definitions and GritQL source. | Runtime/provider implementation. |
| `patterns/apply/*.md` | Positive apply pattern definitions and apply intent. | Diagnostic check execution. |
| `baselines/*.json` | Accepted current violations and baseline state. | New rule intent. |
| `config.md` | Human-readable operation model and vocabulary. | Parseable tool dispatch configuration. |

## Current Owner-Tool Classes

These classes describe existing rule records. They are not the top-level Habitat
ontology and should not grow into a separate adapter configuration language.

- `grit-check`: diagnostic source patterns authored under `patterns/checks`.
- `pattern-apply`: apply patterns authored under `patterns/apply`.
- `file-layer`: file-presence, generated-artifact, and protected-surface checks
  that are explicitly represented as Habitat rules.
- `format-check`: formatting and import hygiene represented as Habitat rules
  but executed by Biome.
- `nx`: workspace graph and boundary checks represented as Habitat rules but
  executed through Nx.
- `command-check`: temporary adapter class for command-backed checks that have
  not yet been rewritten as Grit, Biome, Nx, file-layer, or test-backed rules.
- `test-check`: reserved class for structural tests admitted as Habitat rules.

Long term, Habitat's user-facing operation model should be domain-oriented:
`check`, `apply`, `generate`, and `verify`. How each operation reaches Grit,
Biome, Nx, Vitest, Bun, or shell commands is Toolkit code.

## Migration Implications

The next consolidation slices should:

1. Convert pattern-backed `source-check` rules to `grit-check`.
2. Classify command-backed root lint scripts as either authored Habitat policy
   or Toolkit execution mechanics. Do not create a `.habitat/tooling` layer for
   generic command dispatch.
3. Decide which structural-looking tests are true Habitat rules and register
   them, leaving product/domain tests in package test trees.
4. Make `.grit/grit.yaml` an execution bridge to Habitat patterns, not a second
   pattern source.
5. Keep Nx, Biome, Husky, CI, and package scripts as thin execution layers whose
   authority is traceable to this tree.

## Stop Conditions

Stop a consolidation slice if it creates any of these states:

- an authored structural policy exists with no Habitat rule identity;
- generic tool dispatch is modeled as repo-authored `.habitat` configuration
  instead of Toolkit source;
- a pattern exists outside `.habitat/patterns` with no bridge rationale;
- a baseline exists outside `.habitat/baselines`;
- an external config claims structural meaning not represented in `.habitat`;
- a test is used as a structural gate without either Habitat registration or an
  explicit product-test classification.
