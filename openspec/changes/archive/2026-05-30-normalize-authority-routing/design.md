## Context

The packet already states that it supersedes the review, independent review,
decision comparison, Codex decisions, independent decisions, and debate
artifacts. The risk is not that those sources exist; the risk is that an agent
or implementer treats them as equal authority after the packet has been
accepted.

## Goals / Non-Goals

**Goals:**

- Make the authority freeze observable from repo files.
- Preserve source materials as provenance.
- Define the change train ordering in OpenSpec without beginning
  implementation.
- Establish review lanes for the rest of the train.

**Non-Goals:**

- Change MapGen behavior.
- Reconcile every stale canonical doc in this slice.
- Archive OpenSpec changes or promote implemented requirements.

## Decisions

### Keep Source Materials, But Label Them Non-Normative

The source docs remain useful evidence. They must not be deleted or rewritten
as if they never existed. The routing fix is to ensure they are clearly source
material and that current work enters through the packet.

### Treat This As A Closure Gate, Not A Refactor Slice

Domino 0 may already be mostly satisfied. This change exists so the rest of the
OpenSpec train has an explicit prerequisite and reviewable evidence.

## Risks / Trade-offs

- The slice can become busywork if it edits stale docs substantively. Mitigate
  by restricting it to routing, labels, and evidence.
- Late docs may still contain stale stage names. Topic-specific docs are
  updated in the corresponding implementation slices, not here.

## Review Lanes

- Architecture owner: confirms packet/source authority order.
- Product/DX reviewer: confirms implementer entrypoints are not confusing.
- Adversarial reviewer: searches for competing active decision docs and stale
  router paths.
