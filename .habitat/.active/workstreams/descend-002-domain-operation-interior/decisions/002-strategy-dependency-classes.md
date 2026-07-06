# Decision Packet 002: Strategy Dependency Classes

Status: open; awaiting user ruling

Question:
which import classes are law for strategy files
(`ops/<operation>/strategies/*.ts`)? This ruling becomes the generic positive
strategy import law and retires the foundation-local negative guard.

Why this is nondeterministic:
the corrective audit rejected promoting
`prohibit_foundation_strategy_nonlocal_imports` as-is because its allowlist is
underbroad: "other strategies legitimately import support dirs, policy, local
types, core libs, same-op strategies, and domain constants." Which of those
observed classes is intended architecture and which is tolerated debt is a
semantic call that current authority does not decide.

Evidence — full census of 509 import specifiers across all strategy files
(2026-07-06):

| Count | Observed class | Example |
| --- | --- | --- |
| 162 | `@swooper/mapgen-core/*` package surfaces | `@swooper/mapgen-core/authoring` |
| 108 | op-local sibling strategies (`./`) | `./default.js` |
| 104 | own operation contract (`../contract.js`) | universal |
| 56 | own operation `rules/` (`../rules/*`) | `../rules/index.js` |
| 53 | own domain `model/*` (up three levels) | `../../../model/policy/geological-resource-signals.js` |
| 13 | own operation `policy/` | `../policy/spacing-floors.js` |
| 3 | own operation `types.js` | |
| 3 | `@civ7/map-policy` package | resources domain |
| 3 | anomalies (rows B1-B3 in the row ledger seed) | cross-domain and cross-operation reaches |

The three anomalies: `placement/ops/plan-starts/strategies/default.ts:18`
reaches `../../../../hydrology/index.js` (cross-domain relative);
`placement/ops/plan-natural-wonders/strategies/default.ts:38` reaches
`@mapgen/domain/hydrology/model/policy/river-class.js` (cross-domain package);
`ecology/ops/plot-effects-score-snow/strategies/default.ts:3` reaches
`../../plan-plot-effects/rules/index.js` (cross-operation).

Proposed law (the recommended default):

Allowed classes:

1. own operation surfaces: `../contract.js`, `../types.js`, `../rules/*`,
   `../policy/*`, sibling strategies `./*`;
2. own domain model: `../../../model/**` (schemas, policy, data);
3. `@swooper/mapgen-core` public surfaces;
4. named external packages already accepted by domain law (currently
   `@civ7/map-policy`).

Forbidden classes (each with an injected-violation probe at ratchet time):

5. any other domain's surfaces, by relative path or package specifier;
6. any sibling operation's internals;
7. adapter/engine runtime, recipe surfaces, root config facades (already
   owned by existing domain-operation rules; the strategy law composes with
   them rather than restating them).

Rulings needed inside the default (the genuinely open sub-questions):

- model breadth: whole own-domain `model/**`, or `model/schemas` +
  `model/policy` only (excluding `model/data`)? Census shows only
  schema/policy imports today; ruling whole-model is simpler, ruling
  narrower is stricter.
- core breadth: any `@swooper/mapgen-core` subpath, or a named subpath
  allowlist? Census shows `authoring` dominates; a named list is stricter but
  adds maintenance.
- external packages: is `@civ7/map-policy` a durable allowance or
  resources-domain debt?
- cross-operation signals: rows B1-B3 need destinations — hoist the shared
  signal into the owning domain's `model/`, or route it through the consuming
  operation's contract inputs. This is per-row semantic work executed under
  whichever boundary you rule.

Consequence of the default: three red rows (B1-B3), everything else green by
construction; the foundation guard retires after clean-sample plus
injected-violation proof through the new law.

Seal target once ruled:
`.habitat/scopes/domain/scopes/ops/scopes/operation/scopes/strategies/patterns/strategy-uses-approved-local-surfaces.md`
becomes the enforced pattern text; enforcement lands in
`.habitat/blueprints/domain-operation/` as a positive rule;
`prohibit_foundation_strategy_nonlocal_imports` retires after survivor proof;
rows B1-B3 lock exact destinations.

Escalation:
if the fresh census at execution open finds new classes beyond this table, or
if the ruled law would turn more than five percent of strategy imports red,
stop: that is law back-talk, and the packet reopens with the new evidence.
