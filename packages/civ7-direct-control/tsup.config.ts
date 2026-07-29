import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/live-control.ts",
    "src/direct-control-error-boundary.ts",
    "src/game-ui/loading-states.ts",
    "src/play/city/town-focus.ts",
    "src/play/diplomacy/first-meet-response.ts",
    "src/play/government/choice.ts",
    "src/play/narrative/choice.ts",
    "src/play/progression/choice-postconditions.ts",
    "src/proof/diplomacy-response-proof-policy.ts",
    "src/proof/progression-player-choice-proof-policy.ts",
    "src/proof/progression-target-proof-policy.ts",
    "src/proof/unit-target-proof-policy.ts",
  ],
  format: ["esm", "cjs"],
  target: "es2022",
  clean: ["!**/*.d.ts", "!**/*.d.ts.map"],
});
