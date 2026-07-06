# Decision Packet 004: Support-Directory Aggregation Grammar

Status: open; expected to close deterministically — escalates only on contrary evidence

Question:
what is the closed grammar for `rules/` and `policy/` internals — is
`index.ts` aggregation required, and does the tectonics shim-re-export sentry
delete by absence?

Why this is a decision packet at all:
the drafted scope files
(`.habitat/scopes/domain/scopes/ops/scopes/operation/scopes/{rules,policy}/`)
already sketch the grammar, and the evidence below points one way. It is held
as a packet only because the grammar choice interacts with decision packet 002
(whether strategy imports go through `../rules/index.js` or may reach
individual rule files) and because deleting a sentry requires an explicit
ruling, not a shrug.

Evidence (2026-07-06):

- `rules/` internals across all operations: 41 directories are `index.ts`
  only; most others are `index.ts` plus named rule files; exactly four lack
  `index.ts` (`foundation/ops/compute-plates-tensors/rules/`,
  `morphology/ops/compute-belt-drivers/rules/`,
  `morphology/ops/plan-foothills/rules/`, `morphology/ops/plan-ridges/rules/`);
- `policy/` internals: two directories lack `index.ts`
  (`placement/ops/plan-starts/policy/`,
  `resources/ops/select-resource-sites/policy/`);
- strategy imports of rules split 56 ways, most through `../rules/index.js`,
  some reaching named files directly;
- zero live re-exports of `lib/tectonics` from foundation ops `rules/`
  (`rg "export .* from" mods/mod-swooper-maps/src/domain/foundation/ops/*/rules/*.ts`
  finds only local `./` re-exports), so
  `prohibit_foundation_rules_tectonics_shim_reexports` currently guards an
  absent shape.

Proposed ruling (the recommended default):

1. `rules/` and `policy/` are closed to `.ts` files with a required `index.ts`
   aggregation surface; no nested directories;
2. sibling files import each other freely inside the directory; consumers
   outside the directory (strategies, `index.ts` of the operation) import
   through the aggregation surface;
3. the six gap rows (C1-C6 in the row ledger seed) get mechanical `index.ts`
   aggregations;
4. `prohibit_foundation_rules_tectonics_shim_reexports` deletes after the
   grammar ratchets, with an injected shim re-export probe failing the
   survivor law and the absence evidence quoted in the closure receipt;
5. `prohibit_domain_artifacts_modules` (row A2) deletes in the same pass once
   the closed file grammar makes a nested `artifacts.ts` fail the survivor
   law — reusing the exact probe the post-ratchet revalidation used.

Consequence: six mechanical rows, two sentry deletions with survivor proof,
and one grammar that both decision packet 002 and the structure law can cite.

Seal target once ruled:
the drafted `rules/` and `policy/` scope files become enforced grammar (via
`structure.toml` scopes and, if needed, file-shape patterns) under
`.habitat/blueprints/domain-operation/`; rows A2, A4, C1-C6 flip to defined
destinations.

Escalation:
this packet escalates to a real user ruling only if the fresh census finds a
`rules/` or `policy/` internal that the proposed grammar cannot express
(nested directories with live consumers, non-TypeScript assets, or a live
re-export whose consumers depend on the shim path). Absent that, the DRA may
seal the default and record it here.
