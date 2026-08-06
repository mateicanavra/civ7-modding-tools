# Service Compatibility Law

Habitat 0.5.2 deliberately does not select `service@1`. This directory is the
small local Civ7 compatibility law used until shared service authority is
published and adopted. It does not define a local Habitat blueprint, copy the
dormant SDK packet, or misclassify a service as `package@1`. Consequently a
service has no `habitat.toml` instance manifest in this lane. The local rules
are selected by their exact Nx owner and retired when shared authority can
express the same kind honestly.

The law owns only durable service invariants:

- a closed standalone project, public `client.ts` face, private `service/`
  implementation, finite module grammar, and closed proof layers;
- exact Civ7 service and module inventories in a separate qualified rule;
- stable source roles: one context owner, contract and router composers, one
  implementation owner, filename-matched operation leaves, and one module
  wiring face;
- module isolation, public-client-only service dependencies, platform-neutral
  service source, one-way production-to-proof dependencies, root-only package
  exports, and exact contract/router/semantics membership.

The law does not select contract-first or router-first authoring, an oRPC or
Effect prerelease spelling, a bridge package, error-constructor syntax,
runtime construction, middleware chaining, or transport mounting. Those are
vendor mechanisms proved from the exact installed artifact through global
`dev:orpc`, `dev:effect-orpc`, and `dev:effect-ts` guidance plus TypeScript and
execution fixtures. `lintEffect`, package exports, Nx boundaries, Knip, and
the owning proof graph retain their native responsibilities.

## Standalone Shape

```text
services/<service>/
  package.json
  project.json
  tsconfig.json
  src/
    client.ts
    service/
      base.ts
      contract.ts
      impl.ts
      router.ts
      modules/<module>/
        AGENTS.md
        contract/{index.ts,<operation>.ts}
        module.ts
        router.ts
        router/<operation>.router.ts
        [middleware/]
        [model/{actors,dto,errors,policy,ports,prompts}/]
  test/
    contract/client.typecheck.ts
    semantics/modules/<module>/<operation>.test.ts
    execution/root.test.ts
```

`src/client.ts` is the sole package entrypoint. A service may re-export its
owned public contract there when a caller genuinely needs boundary metadata;
the private router and implementation are never package subpaths. Another
service consumes only the bound public client and never receives the lower
service's resources, providers, context, or private contract.

The exact operation mirror is executable compatibility-law proof owned by the
service project's ordinary `verify` target. That target invokes
`verify-service-membership.ts` against only its own root, requires
`package.json` to export only `.`, and proves exact
contract/router/semantics filenames with no unmatched suite. Habitat closes
the layer and filename grammar; TypeScript in `client.typecheck.ts` proves the
public root while refusing private subpath resolution. A direct
`semantics/*.test.ts` suite remains structurally refused until qualified law
selects a real cross-module invariant.
