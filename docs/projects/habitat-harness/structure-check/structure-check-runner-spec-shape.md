# Structure-Check Runner Spec Shape

Status: historical prep note, superseded by location-independent rule manifests

## Intent

Create a small Habitat-native mode for declarative file-tree topology checks.
The mode should replace bespoke script checks whose only real job is to
validate filesystem shape.

Current implementation note: active rules are now location-independent
`rule.json` manifests. Identity, placement, runner, and artifact references are
declared in the manifest; the physical packet path is not the execution
contract.

This is not an AST matcher, regex scanner, package validator, graph validator,
or build freshness checker.

## Design Commitments

- Use TOML for the structure authority file.
- Keep `rule.json` as runner metadata.
- Allow globs on roots and child patterns.
- Model structure as scoped filesystem patterns, not `requiredPaths`.
- Keep allowed and forbidden patterns in the same structure file.
- Evaluate direct children per scope; use additional scopes for deeper levels.
- Avoid a whitespace DSL and avoid raw glob ignore semantics as policy.

## Files

A structure-backed rule packet should contain:

```text
rule.json
structure.toml
baseline.json
```

`rule.json` records the current inventory placement and points to the TOML
authority file:

```json
{
  "schemaVersion": 1,
  "id": "preserve_standard_stage_topology_and_path_invariants",
  "title": "Preserve Standard Stage Topology And Path Invariants",
  "placement": {
    "niche": "civ7/mapgen/pipeline",
    "blueprint": "standard-recipe",
    "category": "structure",
    "operationKind": "check"
  },
  "ownerProject": "mod-swooper-maps",
  "lane": "enforced",
  "message": "Standard recipe file topology drifted.",
  "remediate": "Update the structure manifest intentionally when changing standard recipe stage topology.",
  "pathCoverage": [
    {
      "kind": "exact-path",
      "patterns": ["mods/mod-swooper-maps/src/recipes/standard/stages/**"]
    }
  ],
  "supportFiles": {
    "baseline": ".habitat/.../baseline.json"
  },
  "runner": {
    "name": "habitat",
    "mode": "structure",
    "files": {
      "structure": ".habitat/.../structure.toml"
    }
  }
}
```

## TOML Shape

```toml
schemaVersion = 1

[[scopes]]
name = "standard-stage-root"
root = "mods/mod-swooper-maps/src/recipes/standard/stages"
kind = "directory"
mode = "closed"

required = [
  "foundation-mantle",
  "foundation-lithosphere",
  "foundation-tectonics",
  "foundation-orogeny",
  "foundation-projection",
  "morphology-shelf",
  "hydrology-basins",
  "hydrology-rivers",
  "terrain-elevation",
  "terrain-features",
]

forbidden = [
  "foundation",
  "advanced",
  "_legacy-*",
]

[[scopes]]
name = "standard-stage-entrypoints"
root = "mods/mod-swooper-maps/src/recipes/standard/stages/*"
kind = "directory"
mode = "open"
allowEmpty = false

required = [
  "index.ts",
]

forbidden = [
  "*.js",
  "*.mjs",
]

[[scopes]]
name = "standard-recipe-root"
root = "mods/mod-swooper-maps/src/recipes/standard"
kind = "directory"
mode = "open"

required = [
  "recipe.ts",
  "contract-manifest.ts",
]

forbidden = [
  "foundation.ts",
  "advanced.ts",
]
```

## Semantics

Each `[[scopes]]` entry is evaluated independently.

| Field | Meaning |
| --- | --- |
| `name` | Stable diagnostic label for the scope. |
| `root` | Repo-relative glob. Every matched root is checked independently. |
| `kind` | Expected root kind: `directory` or `file`. Use another scope when child kind matters. |
| `mode` | `open` allows undeclared direct children. `closed` requires every direct child to match `required` or `allowed` and not match `forbidden`. |
| `allowEmpty` | Optional boolean decoded by TypeBox with a default of `false`; set to `true` only when zero matching roots is a valid optional geometry. |
| `required` | Direct-child glob patterns that must each match at least once under every matched root. |
| `allowed` | Direct-child glob patterns that are admitted in a closed scope but are not required. |
| `forbidden` | Direct-child glob patterns that must match zero children under every matched root. |

Root globs are patterns too. This lets one scope apply the same child policy to
many directories, for example every stage directory under
`mods/mod-swooper-maps/src/recipes/standard/stages/*`.

Structure matching uses one Git-visible file inventory per rule batch. Tracked
files and non-ignored untracked files participate; ignored paths do not. A
single staged and tagged inventory carries tracked modes so symlinks and
gitlinks are excluded. Effect Platform `readLink` plus `stat` classification
refuses untracked terminal and intermediate links.

Root globs without a real Picomatch globstar walk only the maximum depth
expressed by the pattern. Double stars embedded in a segment are not
globstars. Real globstars and slash-bearing negative extglobs remain recursive.

## Closed Scope Rule

For a `mode = "closed"` directory scope:

1. collect direct children of each matched root;
2. fail if any required pattern has zero matches;
3. fail if any forbidden pattern has one or more matches;
4. fail if any direct child matches none of the required or allowed patterns.

Forbidden wins over required or allowed if a child matches both. The diagnostic
should explain the conflicting patterns.

## Open Scope Rule

For a `mode = "open"` directory scope:

1. collect direct children of each matched root;
2. fail if any required pattern has zero matches;
3. fail if any forbidden pattern has one or more matches;
4. ignore extra children.

## Descendants

Do not add `requiredDescendants` or `forbiddenDescendants` fields in the first
version. Use another scope with a globbed root instead.

Example:

```toml
[[scopes]]
name = "all-stage-entrypoints"
root = "mods/mod-swooper-maps/src/recipes/standard/stages/*"
kind = "directory"
mode = "open"
required = ["index.ts"]
```

This keeps the runner model flat, parseable, and easy to reason about while
still supporting nested structure through scoped root globs.

## Diagnostics

Diagnostics should identify:

- rule id;
- scope name;
- matched root;
- failing pattern;
- actual child path when available;
- failure kind: missing required match, forbidden match, unexpected child,
  root missing, wrong root kind, or pattern conflict.

## V1 Closed Contract

The first implementation treats the TOML as a closed contract:

- top-level fields are only `schemaVersion` and `scopes`;
- scope fields are only `name`, `root`, `kind`, `mode`, `allowEmpty`, `required`,
  `allowed`, and `forbidden`;
- unsupported fields fail clearly instead of being carried as comments or
  metadata.

## Baselines

Use the existing Habitat baseline model. A structure rule can land red with
enumerated diagnostics and later ratchet to green. Baseline contents should
record diagnostic identities, not duplicate the TOML structure spec.

## Non-Goals

- No source regex matching.
- No import/export analysis.
- No AST parsing.
- No package code execution.
- No generated artifact freshness or equivalence proof.
- No Nx graph traversal or target-order proof.
- No recursive DSL or indentation-sensitive syntax.

## Canary Candidates

The first canary should prove:

1. root glob matching;
2. open and closed scopes;
3. required direct child globs;
4. forbidden direct child globs;
5. unexpected-child diagnostics in closed scopes;
6. one conversion that deletes or shrinks a bespoke command-check script.

Good starting packets:

- `preserve_standard_stage_topology_and_path_invariants`, for standard stage
  directory topology;
- a small generated-artifact presence rule, only if the assertion is presence
  rather than freshness;
- a retained domain topology branch from the remaining domain split work, only
  after the source-shape assertions have been separated to Grit.
