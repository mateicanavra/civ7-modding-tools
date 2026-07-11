# Design

## Matrix

Every successful row uses:

- saved setup config `ToT_BasicModsEnabled.Civ7Cfg`;
- basic mods enabled through that saved config;
- map size `MAPSIZE_HUGE`;
- player count `10`;
- a browser-originated `runInGame.start` request with
  `worldSettings.resources: balanced`, retained in that request's generation
  manifest;
- seed `1538316415` unless the row records a different explicit seed before
  execution;
- Studio server and daemon running from this worktree/stack;
- the visible Studio button path.

Required sources:

- Swooper Earthlike: `swooper-earthlike`
- Latest Juicy: `latest-juicy`
- Swooper Desert Mountains: `swooper-desert-mountains`

## Row Oracles

Each row records:

- expected worktree and daemon identity;
- saved setup config selected in UI;
- no raw internal operation envelope in authoring config;
- visible Run in Game click;
- public status/current/event agreement;
- explicit diagnostics lookup for the same request;
- generated mod and deployed snapshot identities;
- setup row readback for the exact admitted
  `{mod-swooper-studio-run}/maps/${runArtifactId}.js`;
- mismatch failure when setup shows a prior request row instead of the admitted
  run artifact id;
- seed, map size, and player count readback before Begin;
- the rendered Run in Game click, browser-originated admitted request with
  `worldSettings.resources: balanced`, and that request's generation manifest
  are retained in the evidence row; Civ7 setup/readback does not establish a
  resulting resource distribution;
- fresh scripting-log markers with request id and generated artifact identity;
- post-start `civ7.live.status` and `civ7.live.snapshot` showing in-game
  generated content with Huge dimensions expected as `106x66`.

## Failure Rows

The final packet also exercises representative recovery checks:

- missed terminal event or browser reload;
- row missing condition;
- stale saved config mismatch;
- repeat run freshness.

These checks verify the runtime terminalizes safely and keeps private details
behind diagnostics lookup.

## Evidence Location

Retained rows live under:

```text
openspec/changes/studio-run-real-user-matrix-closure/workstream/logs/
```

The summary row links to larger captured artifacts where needed. Public records
are redacted before workstream publication.
