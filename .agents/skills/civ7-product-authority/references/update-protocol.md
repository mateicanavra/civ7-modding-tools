# Product Authority Update Protocol

Use this when changing capability owners, flows, policies, consumer gates, or proof boundaries.

## What Triggers An Update

Update canonical docs, accepted project baselines, ADRs, deferrals, or this skill when:

- a capability gains, changes, splits, or retires an owner;
- a public SDK/CLI/plugin/mod/docs contract changes;
- official game-data evidence changes how the repo models a concept;
- MapGen truth/projection ownership changes;
- generated artifact policy changes;
- consumer compatibility or proof boundaries change;
- a project review finding becomes accepted architecture or product authority.

## Update Workflow

1. Name the change type: capability, flow, policy, consumer gate, proof boundary, source map, or sealed decision.
2. Gather evidence: docs, code, tests, official resources, generated artifacts, runtime/game checks, or user decision.
3. Classify evidence strength using `source-map.md`.
4. Update the relevant canonical doc, accepted project baseline, ADR, deferral, or skill reference.
5. Add/update copy-forward assets only if they improve execution.
6. Record a change note using `assets/authority-change-note.md` in the owning ADR, canonical doc update, deferral entry, or `docs/projects/<project>/...` workstream artifact. Do not leave dated change notes loose in this skill folder.
7. Run review for product/domain and architecture placement when implementation follows.
8. Close with allowed and forbidden claims.

## Required Fields For Capability Updates

- Capability name.
- Owner.
- Explicit non-owners.
- Responsibilities.
- Non-responsibilities.
- Authority status: authorized, experimental, internal, compatibility-retained, retired, blocked, or excluded.
- Evidence.
- Consumer impact.
- Excluded claims.
- Last updated date.

## Stop Conditions

Stop and re-ground before implementation if:

- two capabilities could both claim the same responsibility;
- a generated artifact is being promoted to product policy;
- official resources are being used to justify package boundary changes without repo authority;
- a public contract is being changed without consumer gate review;
- proof is being used to settle product policy;
- an unresolved decision is being encoded as fallback or optional behavior.
