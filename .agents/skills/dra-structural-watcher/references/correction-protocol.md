# Correction Protocol

Use this only after a pass finds a material violation that remains after
debouncing active work.

## Material Violation Test

A watcher correction is appropriate when all are true:

1. Current disk evidence shows a live violation or closure overclaim.
2. The violated principle comes from the user-supplied watcher context, repo
   instructions, active authority skills, OpenSpec/workstream artifacts, or an
   accepted unresolved reviewer finding.
3. The issue is a class problem, not a cosmetic nit.
4. The repair demand can be necessary and sufficient: narrow enough for the
   DRA to act, broad enough to remove the class of violation.

If the evidence is historical-only, expected negative guard text, or an active
implementer diff that appears to be integrating the correction, do not write a
new correction yet.

## NOTE-TO-DRA.md

Place the note in the relevant worktree root or closest owning artifact scope.
Keep it direct:

- title;
- status;
- evidence paths/commits;
- violated principle;
- why it matters;
- necessary-and-sufficient repair demand;
- validation expected after repair.

Do not include broad implementation plans or unrelated cleanup.

## Watcher Correction Log

Entries are prepend-only. Add the newest entry at the top of the entries
section and keep older entries intact.

Each entry should include:

- date and short title;
- status (`active`, `open`, `integrated`, `resolved`, `superseded`, or similar);
- violation;
- principle;
- rationale;
- repair demand;
- evidence;
- closure condition.

When updating an existing correction, preserve the audit trail and add the new
status/evidence rather than deleting the entry.

## After Writing

Run `git diff --check` and a scoped readback of the note/ledger. Leave the
repo clean according to the established Git/Graphite workflow whenever the
watcher owns the note or correction artifact. A dirty watcher note is allowed
only as an explicit written handoff state, with the owning path, reason, and
next DRA action named in the report.
