## 1. Corpus Contract

- [x] 1.1 Add a resource domain corpus owner.
- [x] 1.2 Record all 55 official base-standard `Resources` rows.
- [x] 1.3 Separate `staticResourceRowSlot` from runtime numeric id status.
- [x] 1.4 Record source files, base class, valid ages, class overrides,
  placement constraint summary, distribution facts, placeability disposition,
  and strategy-required disposition.

## 2. Artifact Boundary

- [x] 2.1 Add `artifact:resources.corpus` declaration.
- [x] 2.2 Avoid introducing a resources stage shell or moving placement behavior.

## 3. Tests

- [x] 3.1 Assert official corpus count, uniqueness, and row slots.
- [x] 3.2 Assert base-standard `Resources` row order from modinfo load order.
- [x] 3.3 Assert `<Types>` declaration order is not used as the corpus order.
- [x] 3.4 Assert runtime ids remain unverified and caveats stay visible.
- [x] 3.5 Assert resource corpus artifact id and boundary.

## 4. Review And Verification

- [x] 4.1 Complete framed agent review before implementation.
- [x] 4.2 Run focused resource tests and package check.
- [x] 4.3 Run OpenSpec validation and `git diff --check`.
- [x] 4.4 Commit the Graphite slice and leave the worktree clean.
