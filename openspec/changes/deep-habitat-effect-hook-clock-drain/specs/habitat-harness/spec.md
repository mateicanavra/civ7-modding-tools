## MODIFIED Requirements

### Requirement: Habitat Hook Runtime Uses Effect Clock

Hook runtime timestamp acquisition SHALL be explicit Effect work, not ambient
`Date` reads in reusable domain code.

#### Scenario: Hook runtime has no Date fallback

- GIVEN Habitat hook runtime needs a timestamp
- WHEN no `HookRuntime.nowMs` override is provided
- THEN it SHALL acquire current time through Effect `Clock`
- AND it SHALL NOT call `Date.now` or `new Date` from hook-runtime domain
  helpers
- AND test/request overrides MAY still provide `HookRuntime.nowMs`

#### Scenario: Hook trace command durations use effectful timestamps

- GIVEN pre-commit or pre-push hook tracing records command timing
- WHEN a command/check phase starts and ends
- THEN the service procedure SHALL yield timestamps from the hook clock Effect
- AND `durationMs` SHALL remain non-negative
- AND hook output and exit behavior SHALL remain unchanged
