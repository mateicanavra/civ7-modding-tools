# Scenario Corpus

This corpus records the supported, unsupported, and future Habitat scenarios that Phase 2 packet design must preserve or explicitly refuse. It is product-first: scenarios are described from the agent/human task, not from current file layout.

## Product Frame

Habitat is a generic repo-local structural toolkit. Its value is reducing ambiguity for agents and humans before, during, and after repository changes.

Habitat currently helps a user or agent:

- orient to a path or diff,
- run structural checks,
- understand which proof class a result belongs to,
- guard local Git hooks,
- run graph-aware verification,
- manage ratchet baselines,
- use a diagnostic Grit catalog,
- perform tightly guarded structural rewrites,
- scaffold supported uniform structures,
- refuse unsupported shapes rather than silently inventing them.

Habitat does not currently own runtime product behavior, Civ7 game validation, or MapGen recipe/domain/op/stage/step authoring.

## Supported Scenarios

| Scenario | User or Agent Task | Habitat Responsibility | Contract Surface | Proof Class | Non-Claims |
| --- | --- | --- | --- | --- | --- |
| Orient to a path | Before editing, classify a file path and see the owning project, tags, scoped rules, targets, and unavailable targets. | Orientation and Routing consumes Nx metadata and rule metadata. | `habitat classify <path>` JSON. | Command behavior, Nx metadata resolution, classify tests. | Does not prove target execution, runtime behavior, or rule correctness. |
| Orient to a diff | Before applying a patch, classify touched paths in a diff. | Orientation and Routing parses diff input and routes each path. | `habitat classify <diff-text-or-file>` JSON with `schemaVersion: 1`. | Command behavior and diff parser tests. | Does not prove patch safety or apply semantics. |
| Run structural checks | Check current tree against registered Habitat rules. | Structural Enforcement selects rules, executes tools, normalizes diagnostics, applies baselines, and adds built-in integrity checks. | `habitat check`, `CheckReport` schemaVersion 1, `--json`, selectors. | Current-tree command behavior, rule execution tests, schema validation. | Does not prove runtime/product behavior, CI, Grit apply safety, or OpenSpec validity. |
| Validate selectors | Fail early when a requested owner/rule/tool selector is wrong or empty. | Structural Enforcement owns selector vocabulary and selector failure reports. | `rule-selection-integrity` failure report. | Command behavior and selector tests. | Does not prove any real rule executed. |
| Manage baselines | Preserve explicit empty/debt/external-exception states and shrink-only guards. | Baseline Authority owns baseline state and growth/shrink rules. | Baseline JSON files, `--expand-baseline`, baseline-integrity diagnostics. | Baseline contract tests and current-tree integrity check. | Does not authorize arbitrary baseline writes. |
| Verify a handoff | Run Habitat check, then affected Nx proof when check passes, and emit explicit non-claims. | Proof Contract plus Workspace Graph Integration. | `habitat verify`, `VerifyProof` schemaVersion 1. | Command behavior, proof schema tests, affected Nx execution/skipped state. | Not CI, runtime, product behavior, OpenSpec, or apply proof. |
| Export graph facts | Get current Nx graph data through Habitat. | Workspace Graph Integration exposes graph evidence. | `habitat graph`, `--json`. | Command behavior and Nx graph file parsing. | Not a target execution proof. |
| Use hooks for local feedback | Pre-commit/pre-push guard local edits and staged paths. | Local Feedback consumes file-layer, Biome, Grit, resource, and affected-target checks. | `habitat hook pre-commit`, `habitat hook pre-push`, Husky delegators. | Hook trace tests, staged mutation tests, local command behavior. | Hook success is not CI, review, runtime, or product proof. |
| Guard generated/protected zones | Refuse staged edits or drift in generated/protected zones unless the owning generator/proof path accepts them. | Generated/Protected Zone Authority owns zone declarations and guard behavior. | file-layer rules, `generated:check`, hook file-layer pass. | Staged file-layer tests, generated-check drift proof. | Does not regenerate artifacts by itself. |
| Run diagnostic Grit catalog | Execute Grit-backed diagnostics with stable adapter behavior and failure projection. | Diagnostic Pattern Catalog owns Grit acquisition, scan roots, adapter failures, and projected diagnostics. | `habitat check --tool grit-check`, Grit-backed rules. | Native sample proof, current-tree wrapper proof, injected violation tests, adapter failure tests. | Not Pattern Authority admission or apply safety. |
| Govern pattern admission | Create candidate pattern drafts and register governed patterns only with accepted manifests and baseline contracts. | Pattern Governance owns candidate vs registered lifecycle. | `@habitat/cli:pattern`, manifest validator, registration code. | Manifest tests, registration tests, baseline contract proof. | Candidate output is not an active rule, baseline, hook scope, or current-tree proof. |
| Apply approved structural repair | Run the tightly scoped Grit apply transaction for approved patterns. | Transformation Transaction owns dry-run inventory, isolated-copy proof, approved paths, rollback, Biome handoff, and gates. | `habitat fix`, `--dry-run`, Grit apply transaction API. | Safe-write, transaction-copy, rollback, formatter handoff, per-pattern gate proof. | Not broad auto-fix, product proof, baseline shrink proof, or Grit current-tree proof. |
| Scaffold supported uniform project | Create only supported generic uniform project shapes. | Scaffolding owns supported kinds and refusal rules. | `nx g @habitat/cli:project <name> --kind=<foundation|plugin|app>`. | Generator tests and refusal tests. | Not MapGen authoring topology. |

## End-To-End Workflows

| Workflow | Human/Agent Need | Habitat Path | Successful End State | Refusal/Recovery End State |
| --- | --- | --- | --- | --- |
| Plan a repository edit | Understand ownership and proof obligations before changing files. | `classify` path or diff -> read owners/rules/targets -> choose the smallest safe edit. | The agent knows project owner, relevant rules, runnable proof targets, unavailable targets, and non-claims. | If ownership or rule scope is unresolved, output must say what is unresolved and which broader proof remains necessary. |
| Check a change before handoff | Know whether structural repo rules are clean and what failure class remains. | `check --json` -> inspect selector/baseline/current-tree failures -> run targeted remediation or stop. | CheckReport has no enforced failures and records advisory findings separately. | Failures name rule, path, message, baseline state, remediation when available, and proof class; advisory findings cannot block as enforced proof. |
| Prepare review handoff | Produce bounded evidence without implying runtime/product proof. | `check` -> `verify` -> record Graphite status -> state non-claims. | Handoff names commands, branch, base, selected targets, result, post-state, and non-claims. | If check fails, affected Nx proof is skipped and the report states that no verify proof was produced. |
| Apply a structural repair | Use only approved machine rewrites without broad auto-fix risk. | `fix --dry-run` -> inspect inventory/proof -> live apply only when approved -> Biome/gates -> rollback on failure. | Changed paths are approved by the pattern, formatted, gated, and captured with safe-write proof. | Unexpected paths, missing exports, dirty worktree, create/delete without approval, or gate failures stop with rollback/non-claim proof. |
| Add a supported structure | Scaffold a uniform generic project or candidate pattern without inventing unsupported domains. | generator -> preflight/refusal checks -> write supported shape -> classify/check. | Supported project or candidate pattern exists with expected files and proof route. | Unsupported kind, mismatched root/name, non-empty target, missing manifest, or unsupported Authoring Topology returns a designed refusal and next safe action. |
| Commit local work | Get fast local feedback without substituting it for CI/review proof. | `hook pre-commit` -> resource/staged/file-layer/Biome/Grit checks; `hook pre-push` -> affected targets. | Hook passes and states local-feedback proof only. | Hook failure states resource/staged/format/Grit/Nx reason and recovery command, without claiming CI/product status. |

## Unsupported Or Refused Scenarios

| Request | Habitat Response | Reason |
| --- | --- | --- |
| Generate a MapGen domain/op/stage/step/recipe topology. | Refuse or defer to future Authoring Topology work. | Current Habitat substrate is structural, not a MapGen authoring toolkit. |
| Treat `habitat fix` as a general repair engine for all Grit findings. | Refuse or narrow to approved apply patterns. | Most Grit rules are diagnostics; apply safety is per-pattern. |
| Treat hook success as release proof. | Refuse the proof substitution. | Hooks are local feedback only. |
| Treat root `bun run verify` as the same as `habitat verify`. | Refuse the substitution and name proof classes separately. | Root verify is graph-owned Nx aggregate; Habitat verify is diagnostic handoff proof. |
| Grow baselines to hide current debt without explicit introduction guard. | Refuse. | Baselines are shrink-only except modeled introduction. |
| Use generated-zone checks as product/runtime validation. | Refuse the proof substitution. | They prove generated/protected-zone structural state only. |
| Add Civ7-specific logic into generic Habitat core without a host-owned boundary. | Refuse or move behind a pattern/host policy. | Habitat must remain generic repo-local infrastructure. |

## Refusal Contract

Phase 2 packets must treat refusal as a product contract, not a prose afterthought. A designed refusal needs:

- stable refusal kind,
- consumer-visible message,
- blocked action,
- reason in product terms,
- next safe action or owning future work,
- non-claim category,
- proof standard.

Minimum refusal shape for future packet design:

```ts
interface HabitatRefusal {
  kind: string;
  blockedAction: string;
  reason: string;
  nextSafeAction: string | null;
  owner: string;
  nonClaims: string[];
}
```

Refusal proof can be command behavior, generator tests, injected invalid input, or schema validation depending on the surface. Unsupported Authoring Topology, unsafe apply, unsupported project kind, and proof-class substitution all require refusal tests or explicit non-claim records in the relevant packet.

## Operator Ergonomics Standard

Every command-facing packet must specify how the user or agent sees:

- what happened,
- what was refused or accepted,
- the next safe action,
- the proof class,
- what the output does not prove.

Human-readable output and JSON output may differ, but both must preserve the same owner, action, reason, and non-claim truth.

## Product Gaps To Preserve As Future Work

- Authoring Topology: future conventions and acceptance tests for MapGen domain/operation/stage/step/recipe authoring.
- Host-owned generated-zone configuration: generic Habitat should consume host declarations without treating Civ/MapGen zones as universal.
- Pattern-specific apply gates: generic transaction proof should stay separate from product-specific validation such as MapGen public ops export checks.
- Faster proof tiers: local fast proof and review-grade proof need explicit command contracts rather than implicit slow full-suite runs.

## Scenario Design Requirements For Phase 2 Packets

Every later domino packet must include:

- the scenario it protects,
- the domain owner,
- the consumer,
- the public or internal contract,
- the TypeScript state-space problem,
- what behavior must be preserved,
- proof classes and non-claims,
- downstream records to update,
- stop conditions.

Reject any packet that can only be described as "clean up module X."
