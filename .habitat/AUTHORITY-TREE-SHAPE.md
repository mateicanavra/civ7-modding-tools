# Habitat Authority Tree Shape

Status: active consumer reference

## Packet Shape

Every local rule packet is closed to one runner source:

```text
<rule>/
  baseline.json
  pattern.md | structure.toml
  rule.json
```

Grit packets own syntax relationships. Structure packets own closed physical
shape. A packet does not admit `check.*`, generated support, alternate pattern
names, or private execution helpers.

A generic Grit law may own one `pattern.md` and empty `baseline.json` under its
blueprint destination while multiple qualified `rule.json` applications bind
disjoint corpora to that source. This is the one admitted split between law and
application: it prevents copied patterns and keeps each native Grit report
within its bounded acquisition. Application metadata cannot specialize the
pattern or recover membership with filename predicates.

## Placement

```text
.habitat/blueprints/<qualified-kind>/<rule>/
.habitat/civ7/<product-niche>/<rule-lane>/<rule>/
.habitat/docs/<qualified-doc-niche>/<rule-lane>/<rule>/
```

Use `blueprints/` only for a genuine kind whose law is generic across all of
its instances. Use a product niche when the law depends on Civ7, MapGen, a
specific runtime environment, or another qualified product fact. A niche is
not a weaker blueprint and must not become a dumping ground for brittle file
lists.

`_blueprints` and `_remainder` remain visible only where an existing local law
has not yet reached a more truthful owner. New authority does not enter those
lanes.

## Closure

Structure is closed by default. Required entries define the mandatory spine;
allowed entries are the complete exception set. Open containers are not an
incremental migration mechanism.

Shared project-kind topology comes only from the installed Habitat policy
pack. Civ7-local packets may qualify those kinds, but cannot restate their
generic law.
