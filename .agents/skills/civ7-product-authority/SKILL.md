---
name: civ7-product-authority
description: |
  Use in the Civ7 Modding Tools repo when deciding product/domain authority, public SDK or CLI behavior, mod-facing guarantees, official game-data source truth, MapGen domain meaning, consumer compatibility gates, or proof/adoption claims. Trigger phrases include "what owns this product behavior", "does this break SDK users", "does this change CLI behavior", "can generated output prove this", "is this official resource truth", "what does this MapGen domain mean", "is this in-game verified", and "what compatibility gate applies". Pair with civ7-architecture-authority for implementation placement and package boundaries.
---

# Civ7 Product Authority

## Purpose

Use this skill when work changes or depends on what Civ7 Modding Tools promises to users, mod authors, repo maintainers, or generated mod consumers. It separates product/domain authority from implementation topology, generated artifacts, proof observations, and official game-resource evidence.

This skill is intentionally updateable, but it is not a parking lot for unresolved questions or audit findings. Durable product decisions belong in canonical docs, accepted project baselines, ADRs, or deferrals; this skill reflects stable guardrails for applying them.

## When To Use

- Changing SDK builders, generated XML behavior, CLI commands, plugin workflow behavior, MapGen recipe/domain semantics, Swooper Maps behavior, or documentation promises.
- Deciding whether official Civ7 resources, current code, generated output, docs, or in-game checks can support a claim.
- Retiring, reshaping, or preserving a public SDK/CLI/mod/docs contract.
- Updating product capability, flow, policy, consumer gate, or proof boundary records.

## Non-Goals

- Do not use this as a project plan or migration sequence.
- Do not use it to preserve current file topology.
- Do not use official game resources to bypass repo-owned modeling decisions.
- Do not encode unresolved decisions as fallback, optional, or temporary product behavior.
- Do not use it for code placement without `civ7-architecture-authority`.

## Default Workflow

1. **Ground sources.** Read `references/source-map.md` and the relevant controlling docs or accepted project baseline.
2. **Name the capability.** Use `references/capability-map.md` to identify owner, non-owners, and excluded claims.
3. **Trace the flow.** Use `references/flow-set.md` to locate inputs, state/products changed, outputs, generated artifacts, and proof boundaries.
4. **Check policy.** Use `references/policy-map.md` for rules around resources, generated artifacts, public contracts, MapGen truth/projection, docs, and verification.
5. **Check consumers.** Before deleting or reshaping public behavior, record the consumer gate and evidence needed.
6. **Classify the change.** New product decision, source-backed correction, compatibility retention, consumer retirement, projection change, proof-only change, or architecture placement change.
7. **Update durable authority.** If product authority changes, update the relevant canonical doc, accepted project baseline, ADR, or deferral in the same patch; update this skill only for durable guardrail changes.
8. **Close honestly.** State product behavior, consumer impact, proof boundary, and excluded claims separately.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Source map | `references/source-map.md` | Resolving product evidence and authority order |
| Capability map | `references/capability-map.md` | Naming product/domain owners and non-owners |
| Flow set | `references/flow-set.md` | Tracing resource, SDK, CLI, MapGen, mod, docs, or generation flows |
| Policy map | `references/policy-map.md` | Checking durable behavior rules |
| Update protocol | `references/update-protocol.md` | Changing this skill or product/domain authority |
| Failure patterns | `references/failure-patterns.md` | Work smells like proof inflation, topology preservation, or stale-source promotion |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| Capability record | `assets/capability-record-template.md` | Adding or changing a capability |
| Flow record | `assets/flow-record-template.md` | Adding or changing a flow |
| Consumer gate record | `assets/consumer-contract-gate-template.md` | Retaining, retiring, or reshaping public behavior |
| Authority change note | `assets/authority-change-note.md` | Copy into the owning ADR, canonical doc update, deferral, or project workstream artifact when recording a dated authority update |

## Core Invariants

<invariants>
<invariant name="capability-before-implementation">Name the product capability and owner before talking about endpoints, files, tests, or migration steps.</invariant>
<invariant name="official-data-vs-repo-contract">Official Civ7 resources define game facts. The repo owns how those facts become SDK constants, XML builders, CLI behavior, MapGen rules, docs, and mod outputs.</invariant>
<invariant name="generated-output-is-proof-not-policy">Generated XML, `dist/`, `mod/`, and resource outputs prove generation happened. They do not define product policy or editable source truth.</invariant>
<invariant name="public-contracts-need-gates">SDK exports, CLI commands/flags, plugin APIs, docs tutorials, and mod entrypoints cannot be deleted or reshaped without consumer-impact review.</invariant>
<invariant name="mapgen-truth-needs-owner">If MapGen claims deterministic truth, the pipeline must own and verify it. If current behavior delegates a surface to the engine, docs and artifact names must say projection/telemetry/materialization until a controlling decision gives the pipeline deterministic ownership.</invariant>
<invariant name="proof-boundaries-are-explicit">Local tests, package builds, generated XML, deployed mod files, and in-game checks support different claims. Do not generalize one into another.</invariant>
<invariant name="living-map-must-change">Product authority changes and the affected capability, flow, policy, consumer, or proof records change together.</invariant>
<invariant name="unresolved-decisions-stay-non-normative">Open decisions belong in project records, deferrals, or decision requests, not as fallback behavior in normative skill references.</invariant>
</invariants>

## Quick Start

1. Read `references/source-map.md`.
2. Locate the capability in `references/capability-map.md`.
3. Trace the flow in `references/flow-set.md`.
4. Check rules in `references/policy-map.md`.
5. If consumers are touched, copy `assets/consumer-contract-gate-template.md`.
6. If authority changes, use `references/update-protocol.md`.
