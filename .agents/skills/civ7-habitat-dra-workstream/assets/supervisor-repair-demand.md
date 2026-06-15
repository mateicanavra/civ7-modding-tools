# Supervisor Repair Demand Template

```text
Repair demand for <DRA name / branch / workstream>

Blocked claim: <claim that cannot close>
Priority: <P1 | P2>

Violated contract:
- Goal clause or packet contract: <quote or concise paraphrase>
- Evidence: <file:line, command output, branch state, ledger row, or diff>

Required correction:
- <specific implementation or record change required>
- <specific proof that must be supplied>

Stop condition:
- Dependent work <is paused | may continue only on non-dependent files> until this is repaired, source-rejected, invalidated by later evidence, or explicitly moved outside active scope.

Report back with changed files, commands, proof classes, ledger updates, and clean worktree/Graphite state.
```
