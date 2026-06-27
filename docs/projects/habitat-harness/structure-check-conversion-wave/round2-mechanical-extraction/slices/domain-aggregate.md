# domain-aggregate Round 2 Slice

Rules: `enforce_domain_refactor_boundary_profile`
Rows: 35

Owner counts: existing-rule=11, structure-check=3, grit-check=17, delete-demote=3, needs-split=1
Status counts: ready-for-implementation=34, ready-for-split-implementation=1

## Row Index

- cross-op-runtime-imports: existing-rule / ready-for-implementation
- domain-artifacts-modules: structure-check / ready-for-implementation
- domain-deep-imports-outside-domain-roots: existing-rule / ready-for-implementation
- domain-entrypoint-self-reexports: grit-check / ready-for-implementation
- domain-ops-root-presence: structure-check / ready-for-implementation
- domain-refactor-example-heightfield-buffer: delete-demote / ready-for-implementation
- domain-refactor-example-map-artifacts-effects: delete-demote / ready-for-implementation
- domain-tag-artifact-shims: grit-check / ready-for-implementation
- ecology-canonical-module-shape: needs-split / ready-for-split-implementation
- foundation-decomposed-ops-legacy-internals: grit-check / ready-for-implementation
- foundation-duplicate-math-helper-redefinitions: grit-check / ready-for-implementation
- foundation-legacy-aggregate-tectonic-op-surface: grit-check / ready-for-implementation
- foundation-rules-tectonics-shim-reexports: grit-check / ready-for-implementation
- foundation-stage-cast-merge-hacks: grit-check / ready-for-implementation
- foundation-stage-sentinel-passthrough: grit-check / ready-for-implementation
- foundation-strategy-nonlocal-imports: grit-check / ready-for-implementation
- foundation-strategy-shared-tectonics-lib-imports: grit-check / ready-for-implementation
- full-profile-stage-roots: structure-check / ready-for-implementation
- hydrology-climate-intervention-tokens: grit-check / ready-for-implementation
- hydrology-map-config-key-tokens: grit-check / ready-for-implementation
- hydrology-narrative-domain-imports: grit-check / ready-for-implementation
- literal-requires-provides-keys: existing-rule / ready-for-implementation
- milestone-prefixed-recipe-tag-catalogs: grit-check / ready-for-implementation
- narrative-swatches-stage-token: grit-check / ready-for-implementation
- op-orchestration-helper-calls: existing-rule / ready-for-implementation
- ops-adapter-context-crossing: existing-rule / ready-for-implementation
- ops-engine-runtime-imports: existing-rule / ready-for-implementation
- ops-map-projection-effect-dependencies: existing-rule / ready-for-implementation
- ops-root-config-facade-imports: existing-rule / ready-for-implementation
- profile-mode-env: delete-demote / ready-for-implementation
- recipe-imports-in-domain: existing-rule / ready-for-implementation
- rng-callback-state-in-ops: grit-check / ready-for-implementation
- runtime-config-default-merges: existing-rule / ready-for-implementation
- runtime-typebox-value-imports: existing-rule / ready-for-implementation
- unknown-bag-config-usage: grit-check / ready-for-implementation

## Worker Notes

- Completed. Source-shape rows moved to narrow Grit packets, topology rows moved
  to structure-check packets, existing-rule rows were delegated after companion
  proof, and delete-demote rows were removed.
- The ecology canonical module row was split: durable file-tree topology moved
  to `require_ecology_canonical_op_module_topology`, while the remaining
  ecology full-profile quality branch stays in the residual command script.
- `require_ecology_canonical_op_module_topology` is intentionally red on 42
  current-tree topology diagnostics.
