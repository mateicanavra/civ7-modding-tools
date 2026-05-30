## 1. Guard Mapping

- [x] 1.1 Map G1-G9 to the cleanup change that makes each guard pass.
- [x] 1.2 Split guard enablement if only some cleanup slices are complete.
- [x] 1.3 Record what each guard proves and what remains outside scope.

## 2. Guard Implementation

- [x] 2.1 Add or enable guards only for achieved structure.
- [x] 2.2 Add seeded-failure tests where practical.
- [x] 2.3 Avoid broad exception buckets.

## 3. Promotion And Archive

- [x] 3.1 Promote implemented decisions into evergreen docs, ADRs, or
      OpenSpec specs.
- [x] 3.2 Archive completed OpenSpec changes only after implementation proof
      exists.
- [x] 3.3 Update packet status or cross-references to name the superseding
      authority for promoted sections.
- [x] 3.4 Record downstream realignment and proof boundaries.

## 4. Verification

- [x] 4.1 Run guard commands and doc lint/tests.
- [x] 4.2 Run `bun run openspec:validate`.
- [x] 4.3 Run archive validation for completed changes only.
- [x] 4.4 Run `git diff --check`.
