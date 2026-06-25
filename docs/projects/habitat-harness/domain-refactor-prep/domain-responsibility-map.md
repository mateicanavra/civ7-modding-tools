# Domain Responsibility Map

This map connects the target Habitat domains to current code, consumers, contracts, and proof classes. It is a preparation artifact for Phase 2 packet design.

## Responsibility Standard

Every domain must have:

- one owner,
- clear consumers,
- a public or internal contract,
- explicit adjacent domains,
- proof classes and non-claims,
- current code evidence,
- TypeScript state-space reduction opportunity.

## Domains

| Domain | Owner | Consumers | Contract | Current Evidence | Proof Classes | Adjacent Domains |
| --- | --- | --- | --- | --- | --- | --- |
| Command/API Contract | Command/API owner | Agents, humans, tests, package consumers | CLI verbs, flags, JSON schemas, exports, root scripts, Nx targets | `/tools/habitat/src/commands/`, `/tools/habitat/src/index.ts`, root `package.json` | Command behavior, API compatibility, schema tests | All domains |
| Proof Contract | Proof owner | DRA, reviewers, verify, hooks, apply, OpenSpec handoff | Proof labels, non-claims, bounded streams, post-state, proof schemas | `VerifyProof`, `GritApplyTransactionProof`, `HookTrace`, `AdapterProofArtifact`, `CheckReport` | Schema/test proof, command proof, Graphite/OpenSpec records | Structural Enforcement, Transformation Transaction, Local Feedback |
| Rule Registry Metadata | Structural metadata owner | Check, classify, Nx plugin, baseline, Pattern Governance | Rule id, owner, tool, lane, scope, hook scope, manifest, generated-zone metadata | `/tools/habitat/src/rules/rules.json`, `/tools/habitat/src/rules/architecture.ts` | Schema validation, selector tests, graph compatibility | Structural Enforcement, Orientation/Routing, Workspace Graph |
| Workspace Graph Integration | Graph owner | classify, verify, root scripts, Nx targets | Nx project/target facts and inferred Habitat target names | `/tools/habitat/src/plugin.js`, `/tools/habitat/src/lib/nx-projects.ts`, `nx.json` | Nx target discovery, classify target proof, affected proof | Orientation/Routing, Proof Contract |
| Orientation and Routing | Orientation owner | Agents/humans before editing | `habitat classify` path/diff output, owner, scoped rules, targets, unavailable target facts | `classifyTarget`, `classifyPath`, `classifyRuleScope` | Command behavior, classify tests, malformed/refusal tests | Rule Registry, Workspace Graph |
| Structural Enforcement | Enforcement owner | check, verify, hooks, Nx targets | Rule selection, normalized diagnostics, report rendering, staged mode, selector failure | `createCheckReport`, `selectRules`, `executeSelectedRules`, `diagnostics.ts` | CheckReport schema, command behavior, rule-selection tests | Baseline, Diagnostic Pattern Catalog, Generated/Protected Zones |
| Baseline Authority | Baseline owner | Structural Enforcement, Pattern Governance | explicit empty/debt/external-exception states, shrink-only guard, introduction manifest | `/tools/habitat/src/lib/baseline.ts`, baseline JSON files | Baseline contract tests, baseline-integrity current-tree check | Structural Enforcement, Pattern Governance |
| Diagnostic Pattern Catalog | Grit diagnostics owner | Structural Enforcement, Local Feedback, Pattern Governance | Grit check acquisition, scan roots, adapter failures, current-tree projection | `/tools/habitat/src/lib/grit.ts`, `.grit/patterns/habitat/check/**` | Native sample, current-tree wrapper, injected violation, adapter failure tests | Pattern Governance, Transformation Transaction |
| Pattern Governance | Pattern Authority owner | Humans/DRA admitting rules or apply patterns | candidate vs registered lifecycle, manifest, baseline contract, hook scope, fixtures | `/tools/habitat/src/rules/pattern-authority/manifest.ts`, pattern generator/registration | Manifest tests, registration tests, baseline proof | Diagnostic Pattern Catalog, Baseline, Scaffolding |
| Transformation Transaction | Apply transaction owner | `habitat fix`, future approved apply packets | dry-run inventory, isolated-copy proof, approved paths, rollback, Biome handoff, gates | `/tools/habitat/src/lib/grit-apply.ts`, apply tests | Safe-write proof, rollback proof, formatter handoff, per-pattern proof | Pattern Governance, Diagnostic Pattern Catalog |
| Generated/Protected Zone Authority | Generated-zone owner | Structural Enforcement, hooks, apply, agents avoiding hand edits | generated/protected zone declarations, staged guard, drift check | `/tools/habitat/src/lib/generated-zones.ts`, `/tools/habitat/scripts/verify-generated-zones.mjs` | Staged guard tests, generated-check proof | Local Feedback, Structural Enforcement |
| Host Policy Boundary | Host policy owner | Generated/Protected Zone Authority, Transformation Transaction, Scaffolding, Authoring Topology fence | Generic declaration/refusal boundary for host-specific paths, generated zones, and per-pattern validation gates | MapGen public ops validation in `/tools/habitat/src/lib/grit-apply.ts`; Civ/MapGen generated-zone declarations in `/tools/habitat/src/lib/generated-zones.ts` | Host declaration schema/refusal tests, command behavior proof, non-claim records | Generated/Protected Zones, Transformation Transaction, Scaffolding |
| Local Feedback | Hook owner | Developers, agents committing/pushing | pre-commit/pre-push behavior, local-only non-claims, staged path policy | `/tools/habitat/src/lib/hooks.ts`, `.husky/*` | Hook trace tests, staged mutation tests, pre-push affected proof | Structural Enforcement, Generated Zones, Proof Contract |
| Scaffolding | Scaffolding owner | Agents creating supported uniform structures | supported project kinds, refusal rules, pattern candidate creation | `/tools/habitat/src/generators/project/`, `/tools/habitat/src/generators/pattern/` | Generator tests, refusal tests | Pattern Governance, Authoring Topology fence |
| Authoring Topology Fence | Future authoring owner | DRA, future product work | explicit non-implementation boundary for MapGen authoring topology | `AUTHORING-NEXT.md`, `GAPS.md`, domain packet | Refusal/non-claim proof, future trigger | Scaffolding, Orientation/Routing |

## Proof Class Separation

Do not substitute these proof classes for one another:

- OpenSpec validation,
- TypeScript tests,
- command behavior,
- current-tree checks,
- runtime/product proof,
- Graphite state,
- Nx graph proof,
- hook local feedback,
- Grit native sample proof,
- Grit current-tree wrapper proof,
- injected violation proof,
- baseline contract proof,
- safe-write/rollback proof.

## Domain Boundaries To Protect

- Hooks consume check, Grit, generated-zone, Biome, and Nx proof paths but own only local feedback.
- Pattern Governance decides whether a pattern may become registered; Diagnostic Pattern Catalog decides how Grit diagnostics run.
- Transformation Transaction decides whether a write is safe; it does not prove current-tree diagnostics or product behavior.
- Workspace Graph Integration owns target truth; Orientation/Routing presents that truth to agents and users.
- Scaffolding owns supported uniform structures and refusals; Authoring Topology remains future work.
- Host-specific generated-zone and MapGen gates must not become generic Habitat core claims without a host policy boundary.
- Host Policy Boundary is a first-class gate but not automatically a standalone packet. It becomes a separate packet only if the packet-minimization gate shows that D9, D10, or D13 cannot own the declaration/refusal contract without coupling generic Habitat to host-specific behavior.
