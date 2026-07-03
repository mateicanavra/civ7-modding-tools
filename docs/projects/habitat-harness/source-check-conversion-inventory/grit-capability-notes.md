# Grit Capability Notes

Status: shared calibration packet for lane agents

Agents must assume Grit can express more than trivial regex. The default posture
is: if a predicate can be represented cleanly as structural matching or
path-scoped source matching, prefer Grit pattern authority unless there is a
specific evidence-backed reason not to.

Official references used for this workstream:

- [Patterns](https://docs.grit.io/language/patterns): patterns search code and
  may optionally transform it; JavaScript/TypeScript snippets can be structural
  patterns with metavariables.
- [Syntax](https://docs.grit.io/language/syntax): supports `not`, `maybe`,
  `contains`, `within`, `after`, `some`, `where`, assignment, `bubble`, `limit`,
  `sequential`, custom functions, and `range`.
- [Functions](https://docs.grit.io/language/functions): supports built-in
  helpers and custom JavaScript functions with access to parameter text.
- [Custom Patterns](https://docs.grit.io/guides/patterns): supports named
  reusable patterns and private patterns.
- [Configuration](https://docs.grit.io/guides/config): custom patterns can be
  configured and reused through Grit tooling.

Classification implications:

- Import/export source checks are usually Grit candidates.
- Identifier, property access, call expression, and path-scoped structural
  checks are usually Grit candidates.
- Pure string bans in source or markdown are often Grit candidates if scoped
  cleanly by file path or language.
- Rewrites in `.apply.pattern.md` stay pattern authority and should not be
  confused with runtime fixtures.
- Runtime behavior, generated-output currentness, command output semantics, and
  live integration behavior are not Grit candidates merely because text appears
  in a file.
