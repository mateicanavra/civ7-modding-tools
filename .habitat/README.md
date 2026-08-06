# Habitat Authority Tree

This directory contains Civ7's durable Habitat policy. Habitat itself is
installed development tooling: `@habitat-ai/cli@0.5.1` loads the exact
`@habitat-ai/sdk@0.5.1` policy pack and executes this repository's admitted
instances and compatibility rules.

Shared authority owns `app@1`, `package@1`, `plugin@1`, `plugin-nx@1`,
`provider@1`, and `resource@1`. This repository does not copy those laws.
Local authority is limited to product instances, qualified kind law, Civ7
policy, and domain-specific source or structure relationships.

## Layout

```text
.habitat/
  blueprints/<qualified-kind>/<rule>/
  civ7/<product-niche>/<rule-lane>/<rule>/
  docs/<qualified-doc-niche>/<rule-lane>/<rule>/
  index.json
```

Each local packet contains `rule.json`, an empty `baseline.json`, and exactly
one runner source: `pattern.md` for Grit or `structure.toml` for closed
filesystem topology. The one documented exception is a generic Grit pattern
with multiple acquisition-only applications; applications may not specialize
the law.

There is no local Habitat implementation, generated support tree, script
runner, or temporal Habitat workstream. Product migration state lives under
`docs/projects/civ7-capability-realization/`.

## Authority

- [Consumer authority](./AUTHORITY.md)
- [Closed tree shape](./AUTHORITY-TREE-SHAPE.md)
- [Tool separation](./AUTHORITY-TOOL-SEPARATION.md)
- [Conceptual ontology](./AUTHORITY-ONTOLOGY.md)
- [Operation vocabulary](./RULE-OPERATION-KINDS.md)

## Operation

```bash
bun habitat resolve
bun habitat check
bunx nx run <project>:check:policy
```

Use the installed shared blueprint when it expresses the kind. Keep structures
closed, acquire exact subjects, and route executable or behavioral proof to the
owning Nx project rather than inventing another Habitat runner.
