# Design: Habitat Rule Manifest V2 Contract

## Contract

Current rule manifests use schema version 2:

```json
{
  "schemaVersion": 2,
  "id": "example_rule",
  "title": "Example rule",
  "placement": {
    "niche": "habitat/toolkit",
    "blueprint": "example",
    "category": "contract"
  },
  "operation": {
    "kind": "check"
  },
  "supportFiles": {
    "baseline": ".habitat/example/rule/baseline.json"
  },
  "runner": {}
}
```

`placement` answers where the rule is currently inventoried. `operation` answers
what kind of operation the packet performs. `supportFiles` lists rule-owned
files consumed by Habitat but not executed as runners.

## Closed Values

`placement.category` accepts the current rule categories, including `output`,
and rejects `artifact`.

`operation.kind` accepts `check`, `fix`, `generate`, and `migrate`. It rejects
`triage` because triage is a holding-state vocabulary, not an executable
operation mode.

## Connections

The registry loader parses v2 manifests, validates referenced runner files and
support files, and projects typed facts to downstream consumers. Baseline facts
read `supportFiles.baseline`. Nx inputs include manifest, runner files, and
support files. The generator emits v2 manifests so new rules cannot reintroduce
v1 shape.

## Migration Shape

The live corpus is migrated mechanically:

- 126 live manifests become schema version 2.
- 126 `placement.artifactKind: "check"` values become
  `operation.kind: "check"`.
- 126 `artifacts.baseline` paths become `supportFiles.baseline`.
- 9 `placement.category: "artifact"` rows become
  `placement.category: "output"`.

## Review Lanes

- Corpus auditor verifies the 126-row migration.
- Interface reviewer verifies all producer and consumer surfaces read v2.
- Verification reviewer verifies the gates prove v1 contract closure.
