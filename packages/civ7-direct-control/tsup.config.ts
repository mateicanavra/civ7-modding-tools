import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/play/notifications/game-ui-dismissal.ts",
    "src/play/operations/production-choice-proof.ts",
    "src/play/progression/choice-postconditions.ts",
    "src/proof/diplomacy-response-proof-policy.ts",
    "src/proof/first-meet-response-proof-policy.ts",
    "src/proof/government-choice-proof-policy.ts",
    "src/proof/narrative-choice-proof-policy.ts",
    "src/proof/notification-dismissal-proof-policy.ts",
    "src/proof/population-placement-proof-policy.ts",
    "src/proof/progression-player-choice-proof-policy.ts",
    "src/proof/progression-target-proof-policy.ts",
    "src/proof/turn-completion-proof-policy.ts",
    "src/proof/town-focus-proof-policy.ts",
    "src/proof/unit-target-proof-policy.ts",
  ],
  format: ["esm", "cjs"],
  target: "es2022",
  clean: true,
});
