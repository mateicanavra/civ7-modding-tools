import { resolve } from "node:path";
import {
  assertMaterializerTransactionSettled,
  defaultMaterializeOptions,
  materialize,
  withMaterializerLock,
} from "./materialize.js";
import { checkPinnedApiProjection, materializePinnedApiProjection } from "./projection.js";

const mode = process.argv[2];
if (mode !== "materialize" && mode !== "check" && mode !== "api:generate" && mode !== "api:check") {
  throw new Error("Usage: bun run src/index.ts <materialize|check|api:generate|api:check>");
}

const repoRoot = resolve(import.meta.dir, "../../..");
const materializeOptions = defaultMaterializeOptions(repoRoot, mode === "check");

async function checkApi() {
  await assertMaterializerTransactionSettled(
    materializeOptions.destinationRoot,
    materializeOptions.apiDestinationRoot
  );
  const api = await checkPinnedApiProjection({
    snapshotRoot: materializeOptions.destinationRoot,
    destinationRoot: materializeOptions.apiDestinationRoot,
  });
  await assertMaterializerTransactionSettled(
    materializeOptions.destinationRoot,
    materializeOptions.apiDestinationRoot
  );
  return api;
}

const result =
  mode === "materialize" || mode === "check"
    ? await materialize(materializeOptions)
    : mode === "api:check"
      ? {
          snapshot: null,
          api: await checkApi(),
        }
      : await withMaterializerLock(materializeOptions.destinationRoot, async () => {
          const api = await materializePinnedApiProjection({
            snapshotRoot: materializeOptions.destinationRoot,
            destinationRoot: materializeOptions.apiDestinationRoot,
          });
          return {
            snapshot: null,
            api,
          };
        });
console.log(
  JSON.stringify(
    {
      status: mode === "check" || mode === "api:check" ? "current" : "materialized",
      ...(result.snapshot === null
        ? {}
        : {
            application: result.snapshot.receipt.source.application.longVersion,
            steamBuildId: result.snapshot.receipt.source.steam.buildId,
            snapshot: result.snapshot.receipt.snapshot,
            sourceMaps: result.snapshot.receipt.sourceMaps,
          }),
      api: {
        changed: "changed" in result.api ? result.api.changed : false,
        sha256: result.api.tree.sha256,
        modules: result.api.projection.receipt.modules.shardCount,
        diagnostics: result.api.projection.receipt.emission.diagnosticCount,
        realms: result.api.projection.receipt.realms,
      },
    },
    null,
    2
  )
);
