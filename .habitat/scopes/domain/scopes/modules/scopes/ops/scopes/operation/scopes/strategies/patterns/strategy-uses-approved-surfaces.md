# Strategy Uses Approved Surfaces

Status: active working reference

Subject:
every semantic strategy leaf.

Required behavior:

- all strategies implement the same parent operation contract;
- `config.ts` owns only semantic identity and authored configuration;
- `index.ts` owns deterministic execution and composes only operation-local
  rules plus admitted ancestor model/Core surfaces;
- cross-domain dependencies use public domain or model entrypoints;
- recipes, adapters, engines, private sibling operations, and unrelated
  implementations remain inaccessible.

Executable authority:
`.habitat/blueprints/domain-operation-strategy/require_domain_operation_strategy_import_boundaries/`.
