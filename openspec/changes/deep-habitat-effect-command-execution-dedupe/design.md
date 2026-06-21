# Design: Command Execution Dedupe

## Frame

Rule identity and process execution are not the same thing. Habitat can have
multiple rules that consume the same command output because each rule represents
a different product contract. The command runner should execute the command
vector once, then let each rule interpret the shared result.

## Ownership

- `domains/structural-check/execution.ts` owns rule execution grouping.
- `providers/command` remains the only owner of process execution.
- Rule registry metadata remains the owner of each rule's command vector.

## Implementation

Create command execution groups keyed by `{ executable, argv, cwd }` for command
rules that are not already handled by the format or graph-backed paths. Run each
group through `CommandRunner` once. For each rule in the group, derive the
existing rule-specific diagnostics from the shared `HabitatCommandResult` or
provider failure.

When a group has more than one rule, attach shared timing metadata with a
`command:<vector>` group id. Single-rule command groups keep dedicated timing.

## Risks

- Shared command groups use a group command id instead of a single rule id. That
  is intentional because the process now belongs to the group, not one rule.
- Rule-specific diagnostics still derive from each rule's message and lane, so
  baseline and status behavior remain unchanged.
