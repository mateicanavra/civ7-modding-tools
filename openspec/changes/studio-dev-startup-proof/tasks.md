## 1. Startup Classification

- [ ] 1.1 Record daemon/Vite/RPC URL proof fields.
- [ ] 1.2 Classify port conflict, Nx process, daemon startup, Vite startup, RPC reachability, and direct-control unavailable states separately.

## 2. Implementation

- [ ] 2.1 Repair startup/port handling only where tests or dev proof show a gap.
- [ ] 2.2 Keep Habitat authority files outside this packet unless a downstream finding is accepted.

## 3. Verification

- [ ] 3.1 Run app tests and Vite build.
- [ ] 3.2 Run bounded isolated-port dev startup and cleanup.
- [ ] 3.3 Audit git status before and after.
