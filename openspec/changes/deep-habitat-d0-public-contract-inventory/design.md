# Design

## Responsibility

D0 belongs to the Command/API Contract owner. It inventories the current public
and internal-facing surface so later owner packets can reduce state without
breaking compatibility by accident.

Forbidden owners:

- Structural Enforcement must not define command compatibility while refactoring
  check/report internals.
- Workspace Graph Integration must not define root script compatibility while
  repairing target aliases.
- Local Feedback must not define hook receipt language outside the public hook
  contract.

## Sources

- `docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `docs/projects/habitat-harness/deep-refactor/implementation-reference-frame.md`
- `tools/habitat-harness/src/commands/**`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/diagnostics.ts`
- `tools/habitat-harness/src/lib/grit-apply.ts`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/index.ts`
- `tools/habitat-harness/package.json`
- `tools/habitat-harness/generators.json`
- `tools/habitat-harness/src/generators/**/schema.json`
- `tools/habitat-harness/src/plugin.js`
- `nx.json`
- root `package.json`
- `.husky/pre-commit`
- `.husky/pre-push`

## Contract State Model

Every inventoried surface is classified into one of:

- public stable;
- public versioned;
- package-internal;
- command-only DTO;
- test-only;
- generated/derived;
- deprecated;
- refused.

This model lets later packets distinguish current compatibility promises from
mere reachability through broad exports.

## Public Export Handling

`tools/habitat-harness/src/index.ts` currently exports command DTOs, command
helpers, baseline internals, Grit adapter internals, transaction helpers,
process abstractions, receipt artifact helpers, rule registry data, and Pattern
Authority manifest contracts. The D0 matrix does not make all of these stable.
It records which are command DTOs, which are public versioned governance
contracts, and which are package-internal surfaces that can move only after
local consumers and tests are realigned.

Later facade work is expected. D0 does not implement the facade because its
packet outcome is inventory and compatibility framing.

## Command Invocation Handling

The canonical local command form is:

```bash
bun run habitat <command> ...
```

For JSON check output, the canonical form is:

```bash
bun run habitat check --json
```

The `bun run habitat check -- --json` shape is an observed argument-forwarding
ambiguity and remains non-canonical until a command-surface packet explicitly
changes or refuses it. D0 records the issue as product compatibility risk.

## Non-Claims

D0 does not establish:

- command correctness beyond the existing command-entrypoint test run;
- current-tree structural cleanliness;
- internal module extraction safety;
- future public facade design;
- runtime or product Civ7 behavior;
- CI receipts;
- Grit apply safety beyond existing command/receipt surfaces.

## Review Lanes

D0 requires:

- API/CLI contract review;
- TypeScript public-surface review;
- Product scenario review;
- stale docs/downstream review;
- receipt/workstream review;
- Graphite hygiene review.

Accepted P1/P2 findings block D0 closure until repaired, rejected with source records,
or superseded by explicit authority.
