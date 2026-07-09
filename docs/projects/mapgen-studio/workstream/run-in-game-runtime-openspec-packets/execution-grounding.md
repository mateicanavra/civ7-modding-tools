# Run In Game Runtime Execution Grounding

Status: active executor grounding

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-mapgen-studio-runtime-openspec-packets`

Branch: `agent-codex-mapgen-studio-runtime-openspec-packets`

## Read Set

This grounding follows the required packet-train read order:

- `packet-index.md`
- `packet-authoring-contract.md`
- `structural-authority-matrix.md`
- `target-vocabulary.md`
- all fourteen OpenSpec packets in execution order

It also uses the source proposal
`docs/projects/mapgen-studio/resources/run-in-game-deploy-manifest-proposal.md`,
the workstream process/source inventory, and the repo-local OpenSpec/Habitat,
MapGen, operational, TypeScript, testing, review, oRPC, and Civ7 runtime-control
skills listed below.

## Shape Of The Work

This initiative is a state-space collapse. The current Run in Game path can
still behave like catalog generation with a request-shaped mask: transient
source state can look like durable source, generation can select request data
through ambient files or environment, deployment can imply a rebuild, and public
status can become a carrier for private debugging state. The packet train
removes that middle ground.

The target is deliberately narrow:

```text
one admitted request
  -> one closed launch source
  -> one resolved launch envelope
  -> one request workspace
  -> one generation manifest
  -> one request-local generated mod
  -> one copy-only deployed snapshot
  -> one launched Civ7 runtime observation window
  -> one private attribution/diagnostics record
  -> one safe public status stream
```

From the user's side, success should feel boring in the best way. They press Run
in Game, the UI shows normal public progress, Civ7 starts on the map they asked
for, and if something fails the UI gives a safe category and diagnostics id
rather than a dump of paths, commands, envelopes, or internal records.

From the developer's side, the same boring path should leave enough private
evidence to reconstruct the run: what source was launched, what manifest was
used, what generated files were produced, what was copied, what Civ7 setup row
and runtime marker were observed, what terminal result occurred, and where the
failure belongs.

## Domino Train

1. `studio-run-public-status-diagnostics` narrows the public wire shape before
   internals move. Later packets can add private records without accidentally
   widening UI/status/event payloads.
2. `studio-run-operation-registry-identity` makes request id the operation key
   and introduces the runtime lease. This removes same-content/tombstone
   confusion and gives every mutating runtime step one ownership gate.
3. `studio-run-explicit-cancellation` gives long-running mutation one explicit
   stop command. HTTP abort stops being a hidden control path, and cleanup/lease
   release become deterministic.
4. `swooper-catalog-source-index` gives durable catalog membership a real
   source index before Studio asks for catalog source ids.
5. `studio-run-launch-source-resolution` closes the public start input into
   catalog or editor launch sources and moves resolution authority to the
   server/Swooper boundary.
6. `swooper-map-artifact-file-plan` extracts pure rendering from writing so
   catalog and request generation can share rendering without sharing write
   roots.
7. `studio-run-generation-manifest` creates the request workspace, artifact id,
   manifest digest, and correlation tuple. It is the first point where a request
   becomes a single private generator input.
8. `swooper-run-manifest-generator` makes request generation manifest-only: one
   manifest path in, one generated mod tree out under the request workspace.
9. `swooper-catalog-index-cutover` finishes the catalog side: catalog generation
   reads the catalog source index and emits metadata-only catalog outputs.
10. `studio-run-generator-integration` connects Studio workflow to the
    manifest generator and retires ambient request generation from the server
    path.
11. `studio-run-deployment-snapshot-lease` makes deployment copy-only from the
    generated mod to stable deployed mod id `mod-swooper-studio-run`, protected
    by the runtime lease, and records the deployed snapshot.
12. `studio-run-runtime-observation` proves the deployed request actually made
    it into the launched game through a fresh log window, setup readback,
    request-specific runtime marker, and public `/rpc` live status/snapshot
    reads.
13. `studio-run-attribution-report` assembles the private report from earlier
    records instead of scattering attribution through public status.
14. `studio-run-diagnostics-retention-guards` sets retention, closes temporary
    patterns, verifies SA-01 through SA-13, and runs the final live matrix. This
    packet is closure only when behavior, structural authority, endpoint calls,
    reviewer lanes, and in-game evidence are all green.

The order matters because each domino removes ambiguity needed by the next one.
Public status is safe before private records grow. Operation identity is request
id before repeated inputs matter. Source identity is explicit before manifests
digest it. Rendering is pure before manifest generation uses it. Deployment
copies a generated mod only after generation is request-local. Runtime
observation trusts deployment records only after those records exist. Attribution
and retention close over records that earlier packets have already made real.

## Authority And Skill Ledger

Authority order for conflicts:

1. current user instruction;
2. root and closest `AGENTS.md`;
3. accepted project baselines under `docs/projects/**`;
4. canonical docs under `docs/**`;
5. repo-local product/architecture skills as lenses over those docs;
6. OpenSpec packets as downstream implementation-control records;
7. current code, tests, generated output, resources, logs, and live runs as
   evidence;
8. older records and prior chat as discovery only.

Skills loaded for this initiative:

- `civ7-open-spec-workstream`: packet loop, source map, phase artifacts,
  review disposition, downstream realignment, and clean closure.
- `civ7-habitat-dra-workstream` plus `habitat:systematic-workstream`: authority
  rows, corpus/expectation discipline, proof-class separation, Habitat/Grit
  conflict handling, and structural closure.
- `civ7-mapgen-workstream`: MapGen/Swooper ownership and the rule that live
  source and in-game proof outrank generated-output assumptions.
- `civ7-operational-debugging`: build/deploy/log/Civ7 proof boundaries and
  evidence labels.
- `civ7-orpc-control-architecture`: Studio/Civ7 oRPC and direct-control
  boundary placement; direct-control owns runtime atoms, oRPC composes typed
  procedures and edge calls.
- `civ7-play-game`: live Civ7 CLI/control discipline for in-game state, with
  no invented ids or guessed runtime facts.
- `typescript-refactoring` and `dev:typescript`: state-space collapse,
  type-level invariants, public type discipline, and no unearned abstractions.
- `cognition:testing-design`: falsification-first behavior tests and explicit
  oracles.
- `dev:review-code-quality`: structural review posture, wrong-owner
  preservation, abstraction quality, and deletion of compensation paths.
- `dev:orpc`: contract-first oRPC, `/rpc` endpoint semantics, typed clients,
  handler tests, and public/private error data discipline.

Current external/library reference sources for reviewer lanes:

- official oRPC documentation at `https://orpc.dev/docs`, especially
  contract-first implementation and RPC handler/mounting documentation;
- official Effect documentation at `https://effect.website/docs`, especially
  resource management, scope, cleanup/finalizer, and scheduling docs;
- packet-specific repo-local references for `@civ7/direct-control`,
  `@civ7/control-orpc`, TypeBox/Standard Schema, Nx metadata, Grit, and Habitat
  runner behavior, verified against current source before use.

## Habitat Conflict Protocol

Habitat remains the enforcement plane. If a Habitat rule or Pattern Authority
record preserves a legacy runtime idea that a packet explicitly removes, the
move is not to waive the rule locally. The move is:

1. classify the conflict using the OpenSpec source-map authority order;
2. identify the owning authority record and runner row;
3. update, retire, promote, or disposition the authority record through the repo
   mechanism before relying on the new topology;
4. record the disposition in the packet workstream evidence.

Structural guarantees are positive assertions in the owner runner named by the
matrix: Grit for source shape, structure-check for filesystem topology, Nx
metadata for graph/target topology, and Habitat command checks only for the
closure assertion that cannot be narrower.

## Reviewer And Agent Waves

For each packet, reviewer prompts must name the packet, its upstream dominoes,
the exact files/contracts under review, allowed paths, forbidden assumptions,
and the failure modes to hunt. No reviewer is asked for approval without an
adversarial lens.

Required closeout lanes for every changeset:

- TypeScript refactoring: reachable state, type modeling, public type drift,
  escape hatches, compiler-enforced invariants, and whether comments explain
  what/why rather than narrating code.
- Code quality/structure: owner placement, module cohesion, abstraction quality,
  file sprawl, wrong-owner preservation, and complexity that should be deleted
  instead of moved.
- Library correctness: oRPC contract/transport semantics, Effect
  cleanup/resource practice, direct-control boundary use, TypeBox/schema
  correctness, error/data leakage, and stale adapter pattern cleanup.

Additional packet-specific advisors are used when the packet touches source
resolution, Swooper generation, deployment snapshots, Habitat/Grit authority,
or live Civ7 observation.

## Verification Rhythm

Each packet closes only after:

- the packet's behavior tests run;
- `bun run openspec -- validate <change-id> --strict` passes;
- `bun habitat classify <diff-or-packet-write-set>` runs;
- every classify-reported command runs;
- every packet-specific live endpoint check runs when required;
- the three dedicated reviewer lanes complete and material findings are
  dispositioned;
- evidence is recorded in
  `openspec/changes/<change-id>/workstream/verification-evidence.md`.

The train closes only after `studio-run-diagnostics-retention-guards` runs
`bun run openspec:validate`, SA-14 verifies structural authority closure, actual
Studio `/rpc` endpoint calls exercise the full target vocabulary matrix, and
Civilization 7 produces post-start evidence that the running game is using the
generated Studio-run content. If Civ7, Studio endpoint runtime, live variants,
or reviewer lanes are unavailable, the workstream is open and blocked, not
closed-passed.
