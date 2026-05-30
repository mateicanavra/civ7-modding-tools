## Context

The skill is an operational router. It helps agents identify the runtime
surface being inspected and classify what that evidence proves. It does not
replace architecture, product, OpenSpec, Graphite, or watcher authority.

## File Tree

```text
.agents/skills/civ7-operational-debugging/
  SKILL.md
  references/
    debugging-workflow.md
    operational-paths.md
    proof-boundaries.md
```

## Review Lanes

- Operational review: covers source build, generated output, deployed output,
  logs, official resources, and in-game proof.
- Architecture review: preserves generated-output read-only boundaries.
- DX review: usable under incident pressure.
- Adversarial review: does not become a dumping ground or task log.
