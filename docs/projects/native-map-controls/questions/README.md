# Investigation Question Records

## Scope And Ownership

These ordinary Markdown records are the source for the separate Investigation
Questions section and its links to the pipeline notebook. The
[question index](../triage.md) owns admission and editorial policy. Linear owns
task status, assignment and scheduling. This format does not establish a second
task tracker, a scientific verdict, or a generic graph framework.

The reader must be able to move from a question to its affected pipeline/topic
locations and back. The learning notebook remains a sequential explanation of
Earth processes, modeling choices, stages, steps and operations. A question is
not a chapter, and a location with pending teaching is a valid link target.

## Source Contract

Each file begins with one YAML mapping between `---` delimiters, followed by
the full human-readable question and evidence. Use plain mappings, sequences
and scalars only: no aliases, anchors, merge keys, custom tags, duplicate keys
or additional YAML documents. The initial bodies use ordinary Markdown without
embedded HTML or media. Evidence and source URLs must be public and durable;
private paths, hosts and deployment receipts do not belong in these records.

| Field | Meaning |
| --- | --- |
| `id` | Stable `Q-NNN` identity; never renumber because ordering changes |
| `title` | Human-readable question title |
| `recordKind` | `question` or `confirmed-defect`; a concern alone is not a defect |
| `disposition` | Editorial disposition, initially `open`; not copied Linear progress |
| `sourceRevision` | Full Git revision inspected for the current location mappings and source statements |
| `locations` | Explicit affected-scope links, described below |
| `assessments` | Named, scoped claims and their assessment; never a whole-stage confidence score |
| `verification` | Evidence records with independent scope and provenance |

### Locations

Every location has `id`, `label`, `relation` and `sourceHref`. The stable `id`
uses lowercase letters, digits and hyphens. `sourceHref` points to an immutable
public source location. Optional `stage`, `step` and `operation` identify actual
recipe declarations, not inferred conceptual owners. A step requires its stage;
an operation requires both and uses the canonical operation API path, not a
local binding alias. A rule inside an operation is not another operation.

Optional `lessonIds` names existing stable lesson identities. This is an
explicit editorial relationship, not one inferred from a title or question ID.
For example, Q-001's low-shore substrate location links to `marine-shores`.

`relation` belongs to the question-to-location link. Initial curated values are:

- `question-owner`: the subject whose contract or claim is being investigated.
- `related-producer`: a producer relevant to understanding that question, not
  necessarily an alleged defect owner.
- `downstream-consumer`: a later consumer where a consequence may need checking,
  not a claim that a consequence has already occurred.

Additional relation literals require an explained editorial meaning, not a
fallback `related` edge. Reusing a location ID requires consistent label,
source, recipe coordinates and lesson links across records. Its relation may
differ between questions.

Benchmark predicates are observation/acceptance topics, not generator
operations. They therefore omit recipe coordinates on their owner location;
separate related-producer locations identify the relevant recipe work. Q-003's
relief producers belong to `morphology-features` / `mountains`, not to
`foundation-orogeny` merely because a benchmark has "orogeny" in its name.

### Assessments And Evidence

An assessment has `claim`, `state` and optional `evidenceHref`. `claim` must name
the actual proposition. `state` is `supported`, `unassessed` or `challenged`.
Supported means evidence supports that stated scope; it does not mean the whole
algorithm is physically calibrated. Challenged names a claim facing contrary
evidence; it does not automatically confirm a defect.

A verification record has `kind`, `scope`, `revision`, `date` and `evidenceHref`.
Use the actual evidence producer's full revision. Use an ISO date when known;
explicit `null` means the date was not established, not a default date. If the
producer revision cannot be established, keep the reference in the prose with
its limitation rather than inventing a verification record. The initial
`source-inspection` records establish source facts only. They are not new test
runs, native observations or scientific calibration.

These are independent axes:

- Marine-versus-inland provenance can be supported while the neighborhood
  geometry remains an open question.
- An older verification can remain relevant; age alone does not lower its
  scientific assessment. A source update does not refresh its date or scope.
- No listed question does not mean verified. One supported operation does not
  confer a supported assessment on its step, stage or downstream output.
- A new question or a source-inspection date does not turn an unassessed
  physical claim into a challenged one.

## Projection And Validation

The viewer reads an allowlisted set of these files from an immutable public
revision. Its `PublicSourceMap` contains `repositoryUrl`, `revision`,
`reviewUrl` and `questionPaths`. That revision identifies the question documents;
each document's `sourceRevision` identifies the pipeline source it discusses.
An unmerged review revision must be labeled as such, not presented as main.
No duplicate question prose belongs in a private JSON registry.

The source projection derives location and lesson backlinks from `locations`.
It may render a source-grounded orientation with pending teaching, but must not
invent an assessment badge for an unmapped or undrafted stage. It uses the
recipe's declared stage order. Unknown question, location and stage identities
must remain not-found rather than falling through to unrelated content.

Before admission or publication, check:

- Unique YAML keys and a single document, allowed field shapes, stable unique
  question IDs, and consistent metadata for reused location IDs.
- Exact stage/step/operation membership at `sourceRevision`, including whether
  a named operation is actually bound by that step.
- Existing public evidence targets, safe links, and relative links resolved
  against the selected public document revision without private URL fallback.
- Preserved index anchors and question-to-location-to-question navigation;
  lesson links use existing identities rather than a hardcoded Q-ID switch.
- Supported assessment with an open question, old evidence with a different
  current source pin, and an unassessed location with no invented defect.

Strict YAML checks require a parser that reports duplicates; a parser's
last-key-wins result is not proof of uniqueness. Rendering must also reject
embedded HTML and unsafe decoded URLs, not only filter Markdown link syntax.

## Maintenance

The notebook curator owns grouping, wording, identities and links. The
workstream/domain owner supplies a scientific disposition and any promotion
to implementation. On a meaningful source change or the entry's stated revisit
trigger, review affected claims and mappings; retain historical evidence at its
original revision and scope. Do not refresh unrelated evidence by changing a
top-level source pin.

Keep the original Q headings in the index when moving full entries. Close or
supersede a question with its rationale and a durable successor link rather
than deleting its identity. A contract change that affects viewer interpretation
must be reviewed with the viewer owner before publishing either side.
