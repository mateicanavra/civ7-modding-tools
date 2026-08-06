# Habitat Consumer Model

Status: active human reference; not runtime configuration

`.habitat` contains authored repository policy. The installed
`@habitat-ai/cli` and its exact `@habitat-ai/sdk` dependency own resolution,
execution, Nx projection, hooks, and the shared blueprint pack.

Local runtime configuration is deliberately small:

- `rule.json` identifies the rule, owner, enforced lane, exact coverage,
  counterfactual remediation, and one supported runner;
- `pattern.md` expresses a Grit source relationship;
- `structure.toml` expresses closed filesystem topology;
- `baseline.json` records the empty admitted finding set;
- `.habitat/index.json` maps compatibility owners to Nx project roots.

Rules are checks. Formatting, builds, tests, generated currentness, semantic
validation, and other executable proof stay with their Nx project owners.
There is no local dispatch table, producer bootstrap, generated toolkit, or
temporal authority workspace.

Use `bun habitat resolve` to inspect selected authority and `bun habitat check`
or the projected `check:policy` targets to execute it.
