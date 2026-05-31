## 1. Bridge Removal

- [x] 1.1 Remove CLI bridge flags and bridge transport branching.
- [x] 1.2 Delete CLI bridge utility code and tests.
- [x] 1.3 Add direct CLI `game exec` and `game health` command coverage.
- [x] 1.4 Rename active direct-control environment variables away from
  `CIV7_FIRETUNER_*`.

## 2. Docs And Operational Guidance

- [x] 2.1 Update root and package routers to forbid bridge recreation.
- [x] 2.2 Update operational debugging guidance to use direct tuner control.
- [x] 2.3 Update project/workstream ledgers with final bridge-removal evidence.

## 3. External Shared-Drive Cleanup

- [x] 3.1 Inventory shared-drive bridge scripts and logs.
- [x] 3.2 Remove bridge scripts/wrappers from the shared Windows drive.
- [x] 3.3 Record which audit/log artifacts were deleted or preserved.

## 4. Verification

- [x] 4.1 Run direct-control package build/check/tests.
- [x] 4.2 Run CLI check/build and focused direct-control command tests.
- [x] 4.3 Run Studio build.
- [x] 4.4 Run OpenSpec validation and `git diff --check`.
- [x] 4.5 Record live direct-control proof and any state-dependent boundary.
