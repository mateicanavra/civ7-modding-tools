## 1. Generated Mod Shape

- [ ] 1.1 Read the generated mod renderer, file plan, run manifest generator,
      and deployment snapshot code.
- [ ] 1.2 Verify or repair `.modinfo`, config row, localized text, runtime
      script, and marker generation for request-local map rows.
- [ ] 1.3 Disposition duplicate action group or row identity ambiguity with
      source evidence.
- [ ] 1.4 Ensure deployment snapshot digest and identity match the generated
      mod source for the same request.
- [ ] 1.5 Add or reuse the direct-control-owned Civ7 mod-catalog refresh step
      before live setup/shell row readback when generated metadata changed.

## 2. Tests

- [ ] 2.1 Add generated mod renderer tests for config XML, `.modinfo`, text,
      script path, and correlation markers.
- [ ] 2.2 Add deployment snapshot tests that compare generated source and
      deployed identity/digest.
- [ ] 2.3 Add visibility failure tests using the setup failure taxonomy.

## 3. Verification

- [ ] 3.1 Run `bun run openspec -- validate studio-run-generated-map-mod-visibility --strict`.
- [ ] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [ ] 3.3 Run focused generated mod and deployment snapshot tests.
- [ ] 3.4 Run live setup/shell row readback for a generated
      `{mod-swooper-studio-run}` row after the declared catalog refresh
      boundary.
- [ ] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [ ] 3.6 Record every gate in `workstream/verification-evidence.md`.
