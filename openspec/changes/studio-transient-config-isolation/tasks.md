## 1. Transient Config Boundary

- [x] 1.1 Reproduce the startup failure with stale `studio-current.config.json`
  present.
- [x] 1.2 Exclude `studio-current.config.json` from standard map preset
  validation used by Studio recipe artifact generation.
- [x] 1.3 Add the live-run config path to `.gitignore`.

## 2. Verification

- [x] 2.1 Regenerate Studio recipe type artifacts.
- [x] 2.2 Regenerate map artifacts while confirming only four shipped configs
  are emitted.
- [x] 2.3 Run Studio artifact guard tests.
- [x] 2.4 Restart Studio and verify `localhost:5174` returns HTTP 200.
