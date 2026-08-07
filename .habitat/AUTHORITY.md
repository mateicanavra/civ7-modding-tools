# Habitat Consumer Authority

Status: active

## Authority Order

Habitat is installed development tooling. The selected `@habitat-ai/sdk`
policy pack owns the shared `app@1`, `package@1`, `plugin@1`, `plugin-nx@1`,
`provider@1`, and `resource@1` laws. This repository does not copy, fork, or
reimplement those blueprints.

Repository-local authority is limited to Civ7 product instances, qualified
overlays, adapters, policy, and rules whose meaning cannot be shared without
losing the Civ7 domain. Local rules use the released compatibility face only:

- `pattern.md` for Grit source relationships;
- `structure.toml` for closed filesystem shape;
- `baseline.json` for an empty admitted finding set;
- `rule.json` for identity, owner, exact coverage, remediation, and runner.

Executable checks, builds, tests, formatting, graph boundaries, and dead-code
proof belong to their Nx project owners. They are not Habitat runner kinds.

## Tree

```text
.habitat/
  civ7/<product-niche>/<rule-lane>/<rule>/
  docs/<qualified-doc-niche>/<rule-lane>/<rule>/
  index.json
```

`civ7/` and `docs/` contain qualified product law. Physical placement does not
replace the rule's stable `id`. Any tracked `.habitat/blueprints/` content is
migration substrate, not constitutional authority: it receives no new law and
is deleted when the corresponding shared kind is available.

There is no local Habitat implementation, script runner, file-layer runner,
Nx runner, execution-support bridge, or active Habitat work backlog.

## Admission

1. Adopt the selected shared blueprint exactly whenever it expresses the kind.
2. Refuse an unsupported generic kind and route the missing capability to the
   Habitat owner; never approximate, fork, or repair it locally.
3. Add local law only for a qualified Civ7 or documentation niche whose owner,
   exact subject, positive invariant, and counterfactual remediation are clear.
4. Keep structures closed. Required members define the spine; allowed members
   are explicit exceptions.
5. Acquire subjects from exact roots. Do not broad-scan the repository and
   recover membership with filename guesses.
6. Route executable or behavioral proof to Nx, TypeScript, tests, or the
   product runtime instead of manufacturing another Habitat runner.
7. Retire a local rule when the type system, shared pack, product model, or
   qualified upstream law makes it redundant.

## Operation

- Resolve authority: `bun habitat resolve`
- Check all admitted law: `bun habitat check`
- Check through Nx ownership: `bunx nx run <project>:check:policy`
- Agent stop gate: `bun habitat hook agent-stop`

Canonical platform migration state lives under
`docs/projects/civ7-capability-realization/`; `.habitat` contains durable law,
not temporal work tracking.
