# Failure Patterns

| Failure | Symptom | Repair |
|---|---|---|
| Resource fact becomes product policy | Official XML shape directly dictates SDK/MapGen/API design | Separate game-data fact from repo-owned modeling decision |
| Generated output becomes authority | `dist/` or `mod/` is used as the edit surface | Change source and regenerate |
| Proof inflation | Local tests or generated XML are claimed as in-game correctness | Label proof boundary and gather stronger evidence |
| Public contract drift | SDK/CLI/docs behavior changes without consumer review | Record consumer gate and update docs/tests |
| Project scratch becomes promise | Active review notes are treated as canonical docs | Promote stable knowledge or keep it as project evidence |
| MapGen truth/projection blur | Engine-owned output is documented as deterministic pipeline truth | Decide owner and align artifact names/docs/tests |
| Compatibility by inertia | Old behavior remains because deletion feels risky | Record compatibility gate or delete with proof |
| Authority map neglect | A durable decision changes only code or chat | Update capability/flow/policy/source records |

## Smell Tests

- Which capability owns this behavior?
- Which consumers observe it?
- Is this evidence official data, source behavior, generated output, or runtime behavior?
- What claim remains forbidden after the change?
- Does this belong in a skill/canonical doc, or in a project decision/deferral?

