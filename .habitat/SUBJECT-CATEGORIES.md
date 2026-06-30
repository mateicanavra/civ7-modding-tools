# Habitat Subject Categories

Status: active category model and manifest placement contract

This document defines the universal Habitat authority packet categories. It is
not a runner config, operation-kind schema, blueprint schema, per-packet ledger,
or replacement metadata plane.

The category answers: what failure class is this packet trying to prevent, or
what system guarantee is it preserving? Category names are intentionally single
words so they remain stable manifest placement values. They are not physical
packet path segments in the current tree.

## Category Model

| Category | Definition |
| --- | --- |
| `boundary` | Dependency, import/export, ownership, callsite, construction, package, or capability reach. |
| `structure` | File tree, module shape, project graph, ordering, topology, allowed placement, or required/forbidden layout. |
| `contract` | Public API, schema, manifest, config, service, CLI, module, or authored surface shape. |
| `execution` | Runtime, build, browser, server, client, authoring, or compile-time separation. |
| `output` | Generated, projected, protected, currentness, provenance, or hand-edit protection. |
| `quality` | Formatting, docs hygiene, portability, links, or low-friction repo maintenance. |
| `policy` | Deliberately enforced repo or domain semantic policy that is not reducible to the other categories. |

## Assignment Rules

- If it fails because code reaches across an ownership boundary, choose `boundary`.
- If it fails because shape, layout, order, or placement is wrong, choose `structure`.
- If it fails because an exposed or canonical surface drifts, choose `contract`.
- If it fails because work appears in the wrong runtime or lifecycle phase, choose `execution`.
- If it fails because generated, protected, current, or provenance-bearing outputs drift, choose `output`.
- If it fails because the repo becomes harder to operate, navigate, or maintain, choose `quality`.
- If it fails because a static domain meaning is violated and the failure is not reducible to the other categories, choose `policy`.

Do not create categories from blueprint names, niches, runner names, owner
tools, operation kinds, current defect names, or narrow product handles.

## Placement Contract

The current physical hierarchy is:

```text
.habitat/blueprints/<blueprint>/<packet>/
.habitat/<niche>/_blueprints/<candidate>/<packet>/
.habitat/<niche>/rules/<packet>/
.habitat/<niche>/_remainder/<packet>/
.habitat/<niche>/<child-niche>/...
```

The manifest owns these facts under `placement` so rule inventory remains
location-independent while the tree is being reorganized:

- niche;
- blueprint;
- category;
- operation kind, declared outside placement.

Child filenames own support and execution roles:

| Role filename | Meaning |
| --- | --- |
| `rule.json` | Location-independent rule manifest: stable identity, current placement, operation kind, policy/routing facts, runner file refs, and support file refs. |
| `baseline.json` | Baseline, fixture, current-tree, or generated-output evidence. |
| `pattern.md` | Primary authored pattern source. |
| `apply.pattern.md` | Secondary apply pattern source. |
| `structure.toml` | Structure-check topology source. |
| `check.ts`, `check.mjs`, `check.sh` | Read-only command adapter. |
| `fix.mjs` | Fix operation implementation. |
| `generate.ts`, `generate.sh` | Generate operation implementation. |
| `operation.md` | Provisional identity for non-check operations until typed manifests exist. |

`rule.json` is the inventory source for current placement while the physical
tree is still changing. Do not add `ownerTool`, `detect`, registry prose
`scope`, packet-prefixed role filenames, or packet-local `category.md`.
Runner entrypoints and support files must be explicit manifest references.

## Admission Reading

Admission is inferred from role files until the Authority Activation model
admits explicit blueprint, instance, capability, and niche governance objects:

- `rule.json` means the packet is an admitted executable rule.
- `pattern.md` without `rule.json` means authored pattern evidence, not an
  admitted rule.
- `operation.md` with `fix.*` or `generate.*` means a provisional operation
  identity, not a default read-only check.
- A packet without an admitted role is evidence only and must not enter default
  execution.

## Closure Rule

Do not reintroduce packet-local `category.md` files or packet-prefixed role
filenames. If useful non-derived notes remain, place them in the relevant role
file or a durable authority document. Do not create a replacement per-packet
classification file.
