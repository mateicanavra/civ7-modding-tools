# Real User Path Remediation Execution Frame

Status: active six-packet execution frame after Packet 1 closure

Packet index:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/real-user-path-remediation-packet-index.md`

Source proposal:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/real-user-path-remediation-proposal.md`

## Authority Order For This Wave

Use the normal repo authority order, with the following remediation-specific
tie-breaker:

1. current user instruction and this execution frame;
2. `real-user-path-remediation-packet-index.md` and the six remaining
   remediation OpenSpec packets;
3. `real-user-path-remediation-proposal.md`;
4. `packet-authoring-contract.md`;
5. `target-vocabulary.md` for public status vocabulary, correlation fields,
   generated-mod file classes, retention, endpoint evidence shape, public `/rpc`
   surface requirements, and live-gate mechanics;
6. earlier fourteen-packet runtime records and older target-vocabulary matrix
   rows as historical authority for topology already implemented, not as the
   final successful scenario matrix for this remediation wave.

The final successful matrix for this wave is owned by
`studio-run-real-user-matrix-closure`: Swooper Earthlike, Latest Juicy, and
Swooper Desert Mountains through the rendered browser path using
`ToT_BasicModsEnabled.Civ7Cfg`, Huge map, 10 players, balanced resources, and
seed `1538316415`. If an older target-vocabulary row conflicts with that matrix
shape, treat the older row as superseded for this remediation wave and update
the owning packet/workstream record if implementation reveals a durable
vocabulary change that should be promoted.

`EditorLaunchSource` remains binding while it exists in the accepted
start-input union. The final packet must either run an editor launch-source
contract row through the live public `/rpc` surface, or land an accepted scope
change that removes `EditorLaunchSource` from the closed union before closure.
That row does not replace the three rendered saved-config user scenarios; it
protects launch-source coverage inherited from the earlier runtime train.

## Objective

Finish the Run in Game remediation packet train one packet at a time, on
dedicated Graphite branches stacked above the current OpenSpec packet stack.
Each packet must leave the system working before the next packet begins:
implemented, reviewed, verified, evidence recorded, and downstream assumptions
realigned.

The product outcome is deliberately uninteresting from the user's side: select
a map in Studio, click Run in Game, and Civ7 starts the generated map that was
requested. If a run cannot start, the public UI reaches a terminal safe status
with no private leakage, and explicit diagnostics retain the detail needed to
repair the failure.

## Current Starting Point

The public config precondition packet,
`foundation-orogeny-public-config-surface`, is closed at this stack head. Its
evidence ledger records green OpenSpec validation, Habitat classify-reported
checks, full `mapgen-studio` and `mod-swooper-maps` tests, workspace lint after
the dedicated Effect Biome baseline branch, direct Habitat public-authoring and
generated-entrypoint checks, and required review lanes.

The remaining initiative is the six runtime/user-path packets. The stack has a
dedicated lint stabilization layer below Packet 1:

```text
codex/effect-biome-lint-rules-audit
  -> codex/effect-biome-lint-baseline-stabilization
  -> codex/run-game-remediation-frame
  -> codex/foundation-orogeny-public-config-surface
  -> six remaining remediation packet branches
```

Two unrelated local files are known and protected from staging:

- `scripts/restart-mapgen-studio.sh`;
- `mods/mod-swooper-maps/src/maps/configs/earthlike-wowza.config.json`.

## Remaining Packet Train

The completed public config packet removed config noise before runtime
debugging. The remaining train has six packets:

1. `studio-run-terminal-adoption-invariant`
2. `studio-run-browser-originated-contract`
3. `studio-run-setup-failure-taxonomy`
4. `studio-run-generated-map-mod-visibility`
5. `studio-run-saved-config-modset-reconciliation`
6. `studio-run-real-user-matrix-closure`

Terminal adoption gives the browser a stable way to accept daemon truth. The
browser-originated contract turns the rendered button into the admitted product
surface. Failure taxonomy gives runtime setup failures precise private names.
Generated mod visibility verifies the request-local mod can show a generated
row. Saved-config reconciliation composes that generated row with the user's
Test of Time setup. The final matrix runs the actual user path for the required
map sources and records the retained evidence chain.

The intended collapse is:

```text
daemon terminal truth
  -> rendered browser request
  -> specific setup diagnostics
  -> visible request-local generated map mod
  -> one reconciled saved setup state
  -> retained browser-originated in-game matrix
```

The packets should make each next packet boring: browser tests can trust
terminal adoption, setup repair can trust browser request identity, generated
mod investigation can trust precise setup failure names, saved-config
reconciliation can trust the generated row as a real setup object, and final
closure can run the user matrix instead of discovering architecture mid-flight.

## Execution Rules

- Work one packet at a time.
- Start each implementation packet on its own Graphite branch above the prior
  packet branch.
- Before creating or modifying a packet branch, record `git status --short
  --branch`, `gt ls`, and the current packet dependency state. Isolate unrelated
  dirty files from the changeset. Stop only if isolation would require touching
  unrelated user work.
- Confirm the dependency table in the packet index before opening each packet:
  lower-stack branch present, prior packet evidence complete, strict OpenSpec
  validation green, and dependency artifacts readable.
- Use fresh agents per packet and per work kind. Research teams research,
  implementation teams patch bounded write sets, and review teams review.
- Do not reuse stale agents from earlier packets.
- The orchestrator owns synthesis, merge/integration decisions, verification
  claims, evidence updates, and branch hygiene.
- Accepted P1/P2 findings block dependent work until repaired or dispositioned
  through authority.
- Blockers are inputs. When the fix is not immediate, spawn focused agents to
  investigate and design the resolution, then implement the chosen path.
- Keep Habitat as the enforcement plane. Do not create ad hoc topology scripts
  or alternate authority trees.
- Prefer TypeScript types, public contracts, behavior tests, and existing
  Habitat structure/rules over brittle shape assertions.
- Do not preserve ambiguity through live parallel behavior, locally invented
  transition lanes, or "decide later" text unless a controlling authority
  explicitly authorizes it.

## Per-Packet Loop

Each packet follows the same loop.

1. Read the packet proposal, design, spec deltas, tasks, verification evidence,
   and the source owners named by the write set.
2. Spawn a research/advisor team only for bounded packet questions that can run
   in parallel with local grounding.
3. Convert the packet's likely write set into exact writable paths and protected
   paths for that branch before implementation agents start.
4. Update the packet frame or tasks if source reading reveals a legitimate
   topology or verification correction.
5. Spawn implementation agents only after write sets and interfaces are clear.
   Assign disjoint write sets where possible.
6. Integrate locally, repair type/test failures, and keep packet artifacts
   current.
7. Run packet-declared verification, plus every command reported by Habitat
   classify.
8. Spawn three required review lanes after the changeset is coherent:
   TypeScript refactoring, code quality/structure, and library correctness.
   Add testing-design, Habitat/authority, direct-control, or product reviewers
   when the packet declares them or source reading warrants them.
9. Repair or disposition material findings.
10. Record commands, results, environment notes, and artifacts in
   `openspec/changes/<change-id>/workstream/verification-evidence.md`.
11. Mark packet tasks only after the implementation and verification actually
    satisfy them.
12. Commit the packet branch only when it is a deterministic, reviewable unit.

## Review Team Contract

Every reviewer gets the same grounding core: packet objective, controlling
authority, write set, forbidden owners, exact files/contracts under review,
severity scale, and failure modes to hunt.

Required lanes:

- TypeScript refactoring: type modeling, state machines, public type drift,
  escape hatches, and simplification anchored to TypeScript invariants.
- Code quality/structure: ownership, module cohesion, wrong-owner preservation,
  complexity deletion, and comments that explain cornerstone purpose rather
  than narrating lines.
- Library correctness: oRPC/Effect/direct-control/TypeBox use, transport and
  resource semantics, safe payload projection, and current official docs where
  library behavior matters.

Packet-specific lanes:

- Habitat/authority for config, structural, or rule changes.
- Testing-design for behavior/harness changes and final matrix closure.
- Direct-control/Civ7 runtime behavior for setup, mod visibility, saved config,
  and live-game readback packets. This lane is mandatory for
  `studio-run-setup-failure-taxonomy`,
  `studio-run-generated-map-mod-visibility`,
  `studio-run-saved-config-modset-reconciliation`, and
  `studio-run-real-user-matrix-closure`.

## Verification Baseline

Every packet starts with:

- `bun run openspec -- validate <change-id> --strict`
- `bun habitat classify <packet-write-set-or-diff>`
- every command reported by Habitat classify
- packet-specific behavior tests
- packet-specific live endpoint checks through the running Studio daemon's
  public `/rpc` mount when the packet changes Studio public endpoints, status
  projection, cancellation, Run in Game workflow, direct-control setup/start, or
  final matrix behavior
- rendered browser-originated checks when the packet admits, observes, or closes
  the visible Studio button path
- packet-level redaction scans whenever public payloads, diagnostics lookup,
  retained evidence, or status/current/event surfaces change; final closure
  still reruns the aggregate redaction scan over all retained logs and payloads
- the stable `mapgen-studio:serve-daemon` target for endpoint and rendered UI
  evidence; it keeps `bun-source` source resolution while excluding Bun watch so
  Run in Game materialization cannot restart the operation owner mid-run
- required review lanes
- structural-rule evidence for any Habitat/Grit change: lifecycle, owner
  surface, scan roots, positive assertion, fixture strategy, current-tree scan
  result, baseline/introduction contract, hook scope, and promotion or removal
  condition

The final packet additionally runs:

- `bun run openspec:validate`
- `nx run mapgen-studio:test`
- contract/server/app/UI checks reported by Habitat
- rendered-button live matrix for Swooper Earthlike, Latest Juicy, and Swooper
  Desert Mountains with `ToT_BasicModsEnabled.Civ7Cfg`, Huge map, 10 players,
  balanced resources, and seed `1538316415`
- generated row readback after saved-config/mod-set reconciliation and before
  Begin, with no later setup reload that invalidates the checked state
- post-start request-specific generated-artifact marker observed from the
  running game and matching `RunCorrelation`; status or snapshot shape alone is
  supporting evidence, not closure
- `EditorLaunchSource` live public `/rpc` row while the accepted start-input
  schema still contains that source kind, unless an accepted scope change removes
  it before final closure
- stale-artifact freshness rows from target vocabulary: repeat launch and
  distinct launch variants with fresh request/workspace/generated artifact and
  deployment identities
- recovery and failure rows from the final packet: missed terminal event or
  browser reload, generated-row-missing, stale saved-config/generated-mod
  mismatch, and repeat freshness
- live API/control rows from target vocabulary: validation failure, ownership
  conflict, and cancellation
- public/private redaction scan over retained logs and public
  status/current/event payloads, `verification-evidence.md`, captured command
  output, captured artifact paths, diagnostics lookup payloads, and attribution
  records

## Evidence Currency

The evidence row for each gate must identify:

- gate id;
- required, conditionally required, or supporting classification;
- command, protocol, or reviewer prompt;
- preconditions;
- result or exit status;
- artifact path or captured evidence location for every live, review, and
  command gate;
- behavioral oracle;
- evidence class;
- what the result verifies;
- what the result does not replace;
- whether the packet remains not closed;
- verdict.

Use "verification", "evidence", "readback", or "closure gate" for operational
claims. Reserve stronger language for named repository artifacts or commands.

## Branch Plan

Frame branch:

- `codex/run-game-remediation-frame`

Implementation branch sequence:

- `codex/studio-run-terminal-adoption-invariant`
- `codex/studio-run-browser-originated-contract`
- `codex/studio-run-setup-failure-taxonomy`
- `codex/studio-run-generated-map-mod-visibility`
- `codex/studio-run-saved-config-modset-reconciliation`
- `codex/studio-run-real-user-matrix-closure`

Do not restack unrelated branches globally. Use Graphite branch creation,
targeted modify/commit, and stack-local restack only when needed.

## Stop Conditions

Stop and surface the issue only when a true external action is required or a
controlling authority decision cannot be made from the repo:

- Civ7 or Studio endpoint environment is unavailable for a required live gate.
- A destructive repo operation would affect unrelated user work.
- Current authority records conflict and the owner decision cannot be inferred
  from source-map order.
- A packet's required scenario remains failing after investigation identifies a
  concrete product or environment decision outside the current worktree.

Everything else is work: investigate, design, patch, review, verify, and keep
moving.
