# Domain Scope Tree

Status: active working reference

This is the overview for the `domain` blueprint scope tree. A domain is a
recipe-independent owner of pure map-generation truth: contracts, operation
bindings, model surfaces, and artifact contracts.

The tree is generative over the domain kind. Every domain root selected by the
kind-level glob receives the same scope law.

The domain blueprint is governed by the MapGen architecture normalization docs,
step/domain-operation module specs, package/file-structure specs, import policy,
and ownership-boundary authority. Local scope governance lives in each
`scope.md`; this overview only maps the tree and states the blueprint posture.

```text
scopes/domain/
  overview.md
  scope.md
  files/
    index-ts.md
    ops-ts.md
  scopes/
    ops/
      scope.md
      files/
        contracts-ts.md
        index-ts.md
      patterns/
        registry-covers-operation-children.md
      scopes/
        operation/
          scope.md
          files/
            contract-ts.md
            index-ts.md
            types-ts.md
          scopes/
            policy/
              scope.md
              files/
                policy-file-ts.md
            rules/
              scope.md
              files/
                rule-file-ts.md
            strategies/
              scope.md
              files/
                strategy-file-ts.md
              patterns/
                strategy-uses-approved-local-surfaces.md
    model/
      scope.md
      scopes/
        schemas/
          scope.md
          files/
            schema-primitive-ts.md
        policy/
          scope.md
          files/
            policy-concern-ts.md
        data/
          scope.md
          scopes/
            collection/
              scope.md
              files/
                data-file-ts.md
    artifacts/
      scope.md
      files/
        artifact-ts.md
        index-ts.md
      patterns/
        artifact-shape.md
```

Slices execute selected scope activation and inventory. This overview does not
carry scope contracts, file laws, owner rules, or per-slice rows.
