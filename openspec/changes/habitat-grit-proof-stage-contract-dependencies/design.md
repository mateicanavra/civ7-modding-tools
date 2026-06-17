## Design

The row uses native Grit over TypeScript to detect string literal dependency
keys inside top-level `defineStep({ requires, provides })` dependency arrays in
standard recipe stage contract files.

Current predicate:

- `mods/mod-swooper-maps/src/recipes/standard/stages/.*/(?:contract|.*\.contract)\.ts$`
- `defineStep({ ... })` top-level `requires: [...]` or `provides: [...]`
  array elements that are string literals under the native Grit parser.

The predicate intentionally does not own nested `artifacts.requires` or
`artifacts.provides` arrays. Artifact arrays are adjacent typed contract
surfaces and are covered here only as false-positive controls.

Controls:

- typed dependency tag constants;
- typed artifact contract references and artifact string literals under
  `artifacts.*`;
- helper objects outside `defineStep`;
- source strings outside dependency arrays;
- non-contract stage implementation files;
- `.tsx` and other-mod paths.

Non-claims:

- Semantic DAG consistency and missing provider/consumer validation are not
  proven by this row.
- Artifact dependency enforcement is not proven by this row.
- Generated standard recipe artifact parity remains owned by the existing
  artifact guard test and generated artifact workflow.
- Raw direct Grit acquisition, source remediation, apply safety,
  classify/generator behavior, retired parity, broader recipe architecture
  closure, and product/runtime proof remain separate.
