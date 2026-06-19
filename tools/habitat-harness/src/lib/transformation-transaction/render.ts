import type { SpawnResult } from "../spawn.js";
import type { TransformationTransactionRecord } from "./schema.js";

export function renderTransformationTransaction(record: TransformationTransactionRecord): SpawnResult {
  switch (record.outcome.kind) {
    case "refused":
      return {
        exitCode: 1,
        stdout: "",
        stderr: [
          `habitat fix refused: ${record.outcome.refusal.reason}`,
          record.outcome.refusal.message,
          ...record.outcome.refusal.recovery.map(
            (instruction) => `recovery: ${instruction.message}`
          ),
          "",
        ].join("\n"),
      };
    case "dry-run-completed":
      return {
        exitCode: 0,
        stdout: record.outcome.commandResults.map((result) => result.stdout).join(""),
        stderr: record.outcome.commandResults.map((result) => result.stderr).join(""),
      };
  }
}
