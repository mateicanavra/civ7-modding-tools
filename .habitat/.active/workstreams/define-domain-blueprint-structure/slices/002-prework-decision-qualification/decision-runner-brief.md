# Prework Decision Runner Brief

Status: reusable kickoff prompt

Use this prompt to start a fresh DRA on one item from `inventory.md`.

```text
You are the DRA for one Habitat prework decision in the Civ7 Modding Tools repo.

Assume no prior thread context. Rebuild the needed context from this message,
the repo routers, relevant skills, and the active prework decision slice.

Repository:
<absolute checkout path>

Selected inventory item:
<item number and title>

Decision line:
<copy the exact Decision line from inventory.md>

Packet destination:
.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/<NNN>-<slug>/

Mission:
Create the decision packet from
.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/decision-packet-skeleton/
and run the selected decision through closure. The packet answers this one
Decision line with exact row dispositions and write-back targets.

Done means the decision disposition table is fully resolved, not merely that the
packet files are filled out. Every row must either have an exact destination,
delete action, executable-now action, implementation-gated action with the
required reference update named, or an explicitly tracked named later domino.
Untracked or implicit deferrals are not closure.

Grounding:
- Read root AGENTS.md and any nested AGENTS.md for files you touch.
- Read the relevant Graphite/worktree docs before branch or commit work.
- Read:
  - .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/frame.md
  - .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/single-prework-decision-frame.md
  - .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/inventory.md
  - .habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/*.md
  - .habitat/scopes/**/*.md as needed for candidate owners
  - .habitat/.active/workstreams/define-domain-blueprint-structure/scopes/**/*.md if a legacy packet-local scope reference is still relevant.
- Load the skills that change this decision. Use systematic-workstream for the
  pass, investigation-design for source/authority investigation, prompt-design
  for agent prompts, team-design if you fan out lanes, and architecture/product
  skills when owner placement depends on them.

Operating frame:
The selected inventory item is the unit of work. Current paths are evidence,
not architecture authority. Destinations come from active law: scope/file/pattern
docs, decision-book criteria, product/architecture authority, or a named later
owner-law domino. Directory-only destinations require a positive content law.

Config-shaped rows:
For the Domain Model Config Law item, do not classify by `config.ts` filenames.
Classify by role. Stages own public authoring schemas, `knobsSchema`, optional
public-to-internal `compile`, and local step composition. Operations own
operation/strategy contract config. Domains may own reusable semantic
primitives, schema fragments, enums, types, and invariants that stages or
operations compose. Reusable schema primitives route to `model/schemas/`.
Reusable semantic policy routes to `model/policy/`. `model/config/` is not a
destination. Domains do not own stage authoring surfaces or public-to-step
compilation mappings. Root `config.ts` barrels are source evidence or
transitional import facades, not destination authority.

Tool-first investigation:
Before hand-reading broad surfaces, use the available code-intelligence and
history tools to shape the investigation. Narsil MCP is up for this repo, indexed
on the primary worktree, and configured to keep tracking the latest stack state.
Use repo id `civ7-modding-tools#2fa31857` for Narsil calls unless
`list_repos` reports a newer id. Treat Narsil as the first-pass engine for
symbol/reference/caller/import/call-graph evidence and for Git history lenses
such as file history, blame, hotspots, recent changes, and modified files. Use
Git directly in the active worktree for corroborating commands, especially
`git blame`, `git log --follow`, and path-specific history. Use NX for project
analysis and runnable target discovery. Use KNIP dead-code
analysis for deletion candidates, with no fix mode, and record limits.

Packet work:
- Copy the skeleton into the packet destination.
- Fill context.md with the decision boundary, candidate owners, non-owners,
  falsifier, and stop condition.
- Fill workstream.md with the selected evidence plan and lane shape.
- Write agent-briefs.md with exact prompts for the lanes you use.
- Build corpus/source-inventory.md with exact paths/symbols and collars.
- Build corpus/architecture-authority.md from controlling authority.
- Build evidence files that match the selected decision. Start with Narsil for
  graph/reference/caller/import/call-history claims when those claims affect
  disposition. Use KNIP unused-code checks when deletion
  confidence depends on them. Use NX and Git history evidence when project
  ownership, target availability, churn, or historical usage affects the row.
- Write synthesis/disposition-table.md with one row per path or symbol.
- Run fresh review and record findings in reviews/review-findings.md.
- Apply accepted repairs to the packet.
- Update the owning workstream references named by the disposition table.
- If any row is easy and clearly executable now, such as a straightforward
  deletion or obvious split with proof, prefer opening an execution slice from
  this prework packet instead of deferring it by default.

Stop rules:
Stop before source edits, enforcement packets, structure.toml, Grit packets, or
runtime changes unless the user explicitly converts this decision into, or
approves, an execution slice. Stop and report if authority cannot distinguish
the owner, source evidence contradicts the inventory item, or a row needs a
destination law that does not exist.

Blocker definition:
A blocker is any row-level destination, owner, proof, or execution-shape
question that prevents the selected prework decision from being fully resolved.
Packet incompleteness is only a process blocker. Do not answer "resolved" from
packet status; answer from the disposition table.

Closure:
The run is complete when every row is fully resolved: exact destination, delete
action, executable-now action, implementation-gated action with the required
reference update named, or explicitly tracked named later domino. Named later
dominoes must be written to the owning inventory, packet, or later-slice
reference so they cannot be dropped. Review must have no accepted unresolved
P1/P2 findings, the owning references must be updated, Habitat classify and
diff checks must pass for the touched authority tree, and the work must be
committed through the repo's Graphite workflow.

Return:
- packet path;
- item-level decision;
- row disposition summary;
- write-back updates;
- review result;
- validation commands and results;
- commit/branch state.
```
