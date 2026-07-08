# Run In Game Real User Path Remediation Packet Index

Status: reviewed packet train ready for implementation

Source proposal:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/real-user-path-remediation-proposal.md`

Authoring contract:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/packet-authoring-contract.md`

Target vocabulary:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/target-vocabulary.md`

This remediation packet train extends the completed Run in Game runtime packet
train after user-path testing found a rendered Studio button failure that the
endpoint-originated matrix did not catch. The remediation target is one
browser-originated request that carries one public authoring config into one
generated mod, one deployed snapshot, one Civ7 setup row, one started game, one
safe public status stream, and one explicit private diagnostics path.

## Execution Order

1. `foundation-orogeny-public-config-surface`
2. `studio-run-terminal-adoption-invariant`
3. `studio-run-browser-originated-contract`
4. `studio-run-setup-failure-taxonomy`
5. `studio-run-generated-map-mod-visibility`
6. `studio-run-saved-config-modset-reconciliation`
7. `studio-run-real-user-matrix-closure`

## Domino Shape

The sequence deliberately removes confusing public config state before runtime
debugging, then hardens terminal adoption so the browser can be used as a
stable acceptance surface, then makes the rendered browser path an admitted
contract, then sharpens setup failure vocabulary, then verifies the generated
mod as a first-class map mod, then repairs the saved-config/mod-set launch
boundary, and only then runs the full live matrix.

```text
semantic public config
  -> terminal status adopted across browser recovery
  -> browser-originated admitted request
  -> specific setup failure diagnostics
  -> generated mod visible as request-local map mod
  -> generated mod composed into saved setup state
  -> retained live evidence matrix
```

## Packet Dependencies

| Packet | Depends On | Unlocks |
| --- | --- | --- |
| `foundation-orogeny-public-config-surface` | completed runtime packet train and `foundation-authoring-surface-alignment` | author-facing config without internal operation envelopes |
| `studio-run-terminal-adoption-invariant` | completed public status, operation identity, and event recovery packets | UI adoption of daemon terminal state after missed events/reload |
| `studio-run-browser-originated-contract` | public config and terminal adoption packets | rendered Studio button as a first-class request surface |
| `studio-run-setup-failure-taxonomy` | browser-originated request packet | precise private diagnostics for setup row/mod-set failures |
| `studio-run-generated-map-mod-visibility` | setup failure taxonomy and completed generation/deployment packets | generated Studio-run mod is visible as a request-local map mod before saved-config composition |
| `studio-run-saved-config-modset-reconciliation` | generated map mod visibility and setup failure taxonomy | one coherent saved-config/generated-mod/setup/start sequence |
| `studio-run-real-user-matrix-closure` | all prior remediation packets | full realistic user-path matrix and closure evidence |

## Review Contract

Each packet follows the existing packet authoring contract. Before
implementation closure, every packet receives the three required review lanes:
TypeScript refactoring, code quality/structure, and library correctness for
oRPC/Effect/direct-control/TypeBox as relevant. Runtime/config packets also
receive focused testing-design and Habitat/authority review where their
proposal declares it. Packets 4 through 7 also receive dedicated
direct-control/Civ7 runtime behavior review before closure.

Reviewers must hunt for shortcut language, endpoint-only substitution, brittle
structural assertions, internal-data leakage, and comments that narrate code
instead of explaining purpose. Accepted P1/P2 findings block the dependent next
packet until repaired or dispositioned through source authority.

## Final Live Matrix

The remediation train closes only after the rendered browser path succeeds for
the required success rows:

- saved setup config `ToT_BasicModsEnabled.Civ7Cfg`;
- map size `MAPSIZE_HUGE`;
- player count `10`;
- resources `balanced` unless the UI selection explicitly says otherwise;
- seed `1538316415` unless the row records a different explicit seed before
  execution;
- Swooper Earthlike, Latest Juicy, and Swooper Desert Mountains.

The final packet also closes the rows that prevent false green status:

- generated row readback after saved-config/mod-set reconciliation and before
  Begin, with no later setup reload that invalidates the checked state;
- post-start request-specific generated-artifact marker observed from the
  running game and matching `RunCorrelation`;
- repeat launch and distinct launch freshness rows from `target-vocabulary.md`;
- missed terminal event or browser reload recovery;
- generated-row-missing failure;
- stale saved-config/generated-mod mismatch;
- validation failure, ownership conflict, and cancellation through the public
  `/rpc` surface.

The final packet records request id, diagnostics id, generated artifact id,
deployed snapshot identity, setup-row readback, terminal public status,
post-start in-game readback, and redacted public/private evidence status for
every row.
