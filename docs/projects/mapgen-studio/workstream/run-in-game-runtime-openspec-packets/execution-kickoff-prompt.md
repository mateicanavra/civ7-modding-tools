# Run In Game Runtime Execution Kickoff Prompt

Use this prompt to start the agent who will execute the Run in Game runtime
OpenSpec packet train end to end.

```text
You are taking ownership of the MapGen Studio Run in Game runtime
restructuring initiative. This is not a local cleanup. It is a staged runtime
architecture change whose product outcome is simple: the Studio button should
launch exactly the generated map the user requested, show only safe public
status while it works, keep private diagnostics available by explicit lookup,
and leave enough runtime evidence that failures are diagnosable without leaking
internal data to the UI.

Start on the worktree that contains the OpenSpec packet branch. If that branch
has not merged into main, build on top of that packet stack rather than
starting from main. Treat the packet branch as the current planning surface for
this initiative, not as a waiver over canonical repo authority.

Begin by reading the workstream documents in order:

1. docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/packet-index.md
2. docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/packet-authoring-contract.md
3. docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/structural-authority-matrix.md
4. docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/target-vocabulary.md
5. each OpenSpec packet listed in the packet index, in execution order

After reading, write a grounding document in your workstream area. Do not
summarize mechanically. Restate the shape of the work in your own words: how
the packet train sequences as dominoes, what each domino makes easier for the
next one, what the delivered product should do, and what successful completion
should feel like from the user's side. The destination should feel boring in
the best way: one request, one source, one manifest, one generated mod, one
deployment snapshot, one launched game, one safe public status stream, one
private diagnostics path.

In parallel with grounding, curate the skills and authority sources you will
need for the whole initiative. Include operational workstream skills,
OpenSpec/Habitat authority, testing-design, TypeScript refactoring, code
quality/structure review, oRPC, Effect, direct-control/Civ7 runtime control,
and any packet-specific library references. Some existing Habitat Authority
rules may be older than the direction this packet train establishes. Respect
Habitat as the enforcement plane. When a rule appears to preserve a legacy
runtime idea the packets explicitly remove, stop and classify the conflict
against the OpenSpec source-map authority order. Update, retire, or disposition
the owning authority record through the repo's normal mechanism before relying
on the new topology. Do not proceed by locally waiving Habitat authority.

You are both executor and coordinator. Assemble advisor and reviewer waves as
the work proceeds. Prompt your teammate agents carefully: give them the packet
context, the specific lens they own, the exact files or contracts under review,
and the failure modes you want them to hunt. Do not ask for rubber stamps.
Every changeset must receive three dedicated review lanes before it closes:
TypeScript refactoring anchored to the TypeScript refactoring skill, code
quality/structure anchored to code quality review, and library correctness
anchored to oRPC plus current official oRPC, Effect, and packet-relevant
library documentation. All reviewers must also inspect JSDoc and anchor-style
comments, looking for comments that explain what a cornerstone piece is for and
why it exists, not comments that narrate how a line of code works.

Execute one packet at a time. For each packet, read its proposal, design, spec
deltas, tasks, and relevant source code before changing anything. Implement
the packet as one complete domino that leaves the system working. If a design
question appears, stop inside that packet, formulate the question precisely,
assign or perform the investigation, and incorporate the answer before
continuing. Do not write conditional instructions, compatibility paths,
fallbacks, or "we can decide later" text around live ambiguity. Collapse the
state space.

Tests are for behavior: product behavior and code behavior. Structural and
topological guarantees belong in Habitat/Grit/Nx authority rules as positive
assertions. Temporary hazards use temporary Grit patterns. Permanent topology
uses permanent positive assertions. Do not add behavior tests that merely look
for deleted legacy keys, old paths, former environment variables, or retired
implementation names.

Verification is the closing authority, not an optional appendix. For each
packet, run the packet's declared behavior tests, OpenSpec validation, Habitat
classify-reported checks, and packet-specific live endpoint checks. Record
evidence in the packet workstream. A skipped declared gate means the packet is
not complete.

The full packet train only reaches closed-passed after the ultimate live gate:
actual Studio endpoint calls against a running Studio server, the full
variant matrix in target-vocabulary.md, and post-start in-game Civilization 7
evidence that the launched game is using the generated Studio-run content.
API endpoint tests, behavioral unit tests, and in-game verification are all
required. Civilization 7 being unavailable, a Studio endpoint not running, a
failed live case, or an unrun required reviewer lane leaves the initiative
open and blocked; it is not a green handoff.

Work with momentum, but let the packet documents carry the execution detail.
Your job is to make the documents true in the codebase, repair any discovered
misalignment, propagate legitimate deviations forward to later packets, and
keep the system moving toward the target shape: fewer states, clearer
boundaries, no stale generated artifact reuse, no private-data leaks, and a Run
in Game flow that can be verified live end to end.
```
