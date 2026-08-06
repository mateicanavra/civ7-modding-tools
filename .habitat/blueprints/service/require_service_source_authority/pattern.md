---
level: error
tags: [service, positive, authority]
---
# Require Service Source Authority

Service files own stable semantic roles while vendor construction remains free
to follow the exact installed artifact. `base.ts` owns `Context`; `impl.ts`
owns the single `implementation`; contract, module, and router composers expose
only their matching anchor. A contract or router operation leaf exposes exactly
one runtime value whose lower-camel name matches its kebab-case filename.
Default exports and forwarding barrels are not alternate authority.

```grit
language js(typescript)

function require_service_source_authority_leaf_status($filename, $name) js {
  const filename = $filename.text.replace(/\\/g, "/");
  const contract = filename.match(/\/contract\/([^/]+)\.ts$/);
  const router = filename.match(/\/router\/([^/]+)\.router\.ts$/);
  const leaf = contract ? contract[1] : router ? router[1] : null;
  if (!leaf || leaf === "index") return "not-leaf";
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(leaf)) return "bad-file";
  const expected = leaf.replace(/-([a-z0-9])/g, (_all, value) => value.toUpperCase());
  return expected === $name.text ? "ok" : "wrong-export";
}

predicate require_service_source_authority_has_const($statements, $anchor) {
  $statements <: some $statement where {
    $statement <: or {
      `export const $anchor = $value`,
      `export const $anchor: $type = $value`
    }
  }
}

predicate require_service_source_authority_is_base() {
  $filename <: r".*services/[^/]+/src/service/base\.ts$"
}

predicate require_service_source_authority_is_contract_composer() {
  $filename <: r".*services/[^/]+/src/service/(?:contract\.ts|modules/[^/]+/contract/index\.ts)$"
}

predicate require_service_source_authority_is_implementation() {
  $filename <: r".*services/[^/]+/src/service/impl\.ts$"
}

predicate require_service_source_authority_is_module_composer() {
  $filename <: r".*services/[^/]+/src/service/modules/[^/]+/module\.ts$"
}

predicate require_service_source_authority_is_router_composer() {
  $filename <: r".*services/[^/]+/src/service/(?:router\.ts|modules/[^/]+/router\.ts)$"
}

predicate require_service_source_authority_is_leaf() {
  or {
    and {
      $filename <: r".*services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$",
      ! $filename <: r".*/contract/index\.ts$"
    },
    $filename <: r".*services/[^/]+/src/service/modules/[^/]+/router/[^/]+\.router\.ts$"
  }
}

predicate require_service_source_authority_is_context_export($export) {
  $export <: or {
    `export type Context = $type`,
    `export interface Context { $... }`
  }
}

predicate require_service_source_authority_is_composer_anchor($export) {
  or {
    and {
      require_service_source_authority_is_contract_composer(),
      $export <: or {
        `export const contract = $value`,
        `export const contract: $type = $value`
      }
    },
    and {
      require_service_source_authority_is_implementation(),
      $export <: or {
        `export const implementation = $value`,
        `export const implementation: $type = $value`
      }
    },
    and {
      require_service_source_authority_is_module_composer(),
      $export <: or {
        `export const module = $value`,
        `export const module: $type = $value`
      }
    },
    and {
      require_service_source_authority_is_router_composer(),
      $export <: or {
        `export const router = $value`,
        `export const router: $type = $value`
      }
    }
  }
}

predicate require_service_source_authority_is_matching_leaf_export($export) {
  $export <: or {
    `export const $name = $value`,
    `export const $name: $type = $value`
  },
  $status = require_service_source_authority_leaf_status(
    filename=$filename,
    name=$name
  ),
  $status <: includes "ok"
}

or {
  program(statements=$statements) where {
    require_service_source_authority_is_implementation(),
    not {
      require_service_source_authority_has_const(
        statements=$statements,
        anchor=`implementation`
      )
    }
  },
  program(statements=$statements) where {
    require_service_source_authority_is_base(),
    not {
      $statements <: contains or {
        `export type Context = $type`,
        `export interface Context { $... }`
      }
    }
  },
  program(statements=$statements) where {
    require_service_source_authority_is_contract_composer(),
    not {
      require_service_source_authority_has_const(
        statements=$statements,
        anchor=`contract`
      )
    }
  },
  program(statements=$statements) where {
    require_service_source_authority_is_module_composer(),
    not {
      require_service_source_authority_has_const(
        statements=$statements,
        anchor=`module`
      )
    }
  },
  program(statements=$statements) where {
    require_service_source_authority_is_router_composer(),
    not {
      require_service_source_authority_has_const(
        statements=$statements,
        anchor=`router`
      )
    }
  },
  program(statements=$statements) where {
    require_service_source_authority_is_leaf(),
    not {
      $statements <: contains export_statement() as $export where {
        require_service_source_authority_is_matching_leaf_export(export=$export)
      }
    }
  },
  export_statement() as $export where {
    or {
      require_service_source_authority_is_contract_composer(),
      require_service_source_authority_is_implementation(),
      require_service_source_authority_is_module_composer(),
      require_service_source_authority_is_router_composer()
    },
    not { require_service_source_authority_is_composer_anchor(export=$export) }
  },
  export_statement() as $export where {
    require_service_source_authority_is_base(),
    not { require_service_source_authority_is_context_export(export=$export) }
  },
  export_statement() as $export where {
    require_service_source_authority_is_leaf(),
    not {
      require_service_source_authority_is_matching_leaf_export(export=$export)
    }
  },
  or {
    `export default $value`,
    `export * from $source`,
    `export { $..., $name, $... }`,
    `export { $..., $name as $alias, $... }`
  } where {
    or {
      require_service_source_authority_is_base(),
      require_service_source_authority_is_contract_composer(),
      require_service_source_authority_is_implementation(),
      require_service_source_authority_is_module_composer(),
      require_service_source_authority_is_router_composer(),
      require_service_source_authority_is_leaf()
    }
  }
}
```

## Matches a missing context owner

```typescript
// @filename: services/jobs/src/service/base.ts
type Context = { readonly jobs: Jobs };
```

## Matches an alternate contract anchor

```typescript
// @filename: services/jobs/src/service/modules/catalog/contract/index.ts
export const catalogContract = compose(find);
```

## Matches competing implementation anchors

```typescript
// @filename: services/jobs/src/service/impl.ts
export const implementation = implement(contract);
export const runtime = createRuntime();
```

## Matches a mismatched operation export

```typescript
// @filename: services/jobs/src/service/modules/catalog/contract/find-job.ts
export const find = procedure;
```

## Matches a second router authority

```typescript
// @filename: services/jobs/src/service/modules/catalog/router/find-job.router.ts
export const findJob = handler;
export const retryFindJob = retry(handler);
```

## Ignores vendor-independent matching roles

```typescript
// @filename: services/jobs/src/service/base.ts
export type Context = { readonly jobs: Jobs };
// @filename: services/jobs/src/service/modules/catalog/contract/index.ts
export const contract = compose(findJob);
// @filename: services/jobs/src/service/impl.ts
export const implementation = implement(contract);
// @filename: services/jobs/src/service/modules/catalog/contract/find-job.ts
const Input = schema({ id: string() });
export const findJob = procedure.input(Input);
// @filename: services/jobs/src/service/modules/catalog/module.ts
export const module = implementation.catalog;
// @filename: services/jobs/src/service/modules/catalog/router/find-job.router.ts
export const findJob = adapt(runFindJob);
// @filename: services/jobs/src/service/modules/catalog/router.ts
export const router = { findJob };
```
