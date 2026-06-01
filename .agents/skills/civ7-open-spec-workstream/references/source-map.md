# Source Map

Use this file to resolve authority and artifact location for Civ7 workstreams.

## Authority Inputs

Use this order:

1. Direct current user decisions and repo instructions.
2. Root `AGENTS.md` and closest subtree `AGENTS.md`.
3. Accepted project baseline artifacts when they explicitly declare the active target for the work:
   - project specs, consolidated packets, decision packets, and review-disposition records under `docs/projects/<project>/`
   - accepted project-local deferrals and triage records
   - for MapGen / Swooper Maps normalization:
     `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
4. Canonical docs:
   - `docs/PRODUCT.md`
   - `docs/SYSTEM.md`
   - `docs/PROCESS.md`
   - `docs/system/ARCHITECTURE.md`
   - `docs/system/TESTING.md`
   - relevant `docs/system/**` domain docs
5. Repo-local product and architecture skills as operational lenses over controlling docs:
   - `.agents/skills/civ7-product-authority/`
   - `.agents/skills/civ7-architecture-authority/`
6. OpenSpec config, specs, and changes under `openspec/` as downstream
   implementation-control records.
7. Active project notes, reviews, issue docs, and workstream records under `docs/projects/<project>/` after their status is classified.
8. Current code, tests, generated outputs, and official resources as evidence.
9. Archived docs, old branches, session summaries, and scratch as discovery material only.

Repo-local skills do not outrank the controlling docs they route to. If a skill conflicts with accepted project baseline, canonical docs, or direct user guidance, stop and update the appropriate authority record before dependent implementation proceeds.

## Artifact Location

Default phase-control location for implementation work:

```text
openspec/changes/<change-id>/
```

Use OpenSpec's standard files plus a `workstream/` directory for continuity:

```text
proposal.md
design.md
tasks.md
workstream/
```

Inside `workstream/`, use these filenames when needed:

```text
phase-record.md
review-disposition-ledger.md
downstream-realignment-ledger.md
closure-checklist.md
next-packet.md
```

Use `docs/projects/<project-slug>/workstream/<phase-id>/` only for project
control work that is intentionally not an OpenSpec implementation change yet.
OpenSpec remains downstream change management, not architecture authority.

## Current Code And Evidence

Current code, tests, generated outputs, official resources, and in-game checks provide evidence. They do not define target authority unless the relevant controlling product/architecture record says so.

## When To Ask The User

Ask only when sources expose a real decision the workstream owner cannot safely make:

- competing controlling authority records;
- public contract or product ownership change not resolved by docs;
- destructive repo operation affecting another person's work;
- caller/consumer compatibility gate requiring owner signoff;
- irreversible sequence change outside the active goal.

Routine phase mechanics, artifact cleanup, reviewer narrowing, and downstream realignment are workstream-owner responsibilities.
