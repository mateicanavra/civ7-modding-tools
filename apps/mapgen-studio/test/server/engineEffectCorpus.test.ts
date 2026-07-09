import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const runtimeLedgerPath = join(
  repoRoot,
  "openspec/changes/mapgen-studio-engine-effect-corpus/workstream/runtime-corpus-ledger.md"
);
const controlLedgerPath = join(
  repoRoot,
  "openspec/changes/mapgen-studio-engine-effect-corpus/workstream/control-orpc-classification-ledger.md"
);

async function readRepoFile(path: string): Promise<string> {
  return readFile(join(repoRoot, path), "utf8");
}

async function collectSourceFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  const pending = [join(repoRoot, root)];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) continue;
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "dist" || entry.name === "node_modules") continue;
        pending.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".ts")) out.push(fullPath);
    }
  }

  return out.sort();
}

async function readSources(paths: readonly string[]): Promise<string> {
  const sources = await Promise.all(paths.map((path) => readFile(path, "utf8")));
  return sources.join("\n");
}

function exportedMutationDeclarations(source: string): string[] {
  return [...source.matchAll(/export\s+const\s+(\w+)\s*=\s*civ7ControlOrpcMutationProcedure\(/g)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined)
    .sort();
}

function studioContextMethods(source: string): string[] {
  return [...source.matchAll(/^\s{2}([a-z][A-Za-z0-9]*)\(/gm)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined)
    .sort();
}

function studioContextProperties(source: string): string[] {
  return [...source.matchAll(/^\s{2}readonly\s+([a-z][A-Za-z0-9]*):/gm)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined)
    .sort();
}

type LedgerRow = {
  readonly cells: readonly string[];
  readonly raw: string;
};

function parseMarkdownRows(source: string): LedgerRow[] {
  return source
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .filter((line) => !line.includes("| Corpus item |") && !line.includes("| Procedure key |"))
    .map((line) => ({
      raw: line,
      cells: line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    }));
}

function expectLedgerRow(
  rows: readonly LedgerRow[],
  token: string,
  options: Readonly<{
    classificationIndex: number;
    riskIndex: number;
    oracleIndex: number;
    triggerIndex: number;
  }>
): void {
  const row = rows.find((candidate) => candidate.raw.includes(token));
  expect(row?.raw, `${token} needs an explicit ledger row`).toBeDefined();
  expect(row?.cells[options.classificationIndex], `${token} row needs classification`).toMatch(
    /\S/
  );
  expect(row?.cells[options.riskIndex], `${token} row needs risk`).toMatch(/\S/);
  expect(row?.cells[options.oracleIndex], `${token} row needs oracle`).toMatch(/\S/);
  expect(row?.cells[options.triggerIndex], `${token} row needs re-entry trigger`).toMatch(/\S/);
}

const runtimeRowShape = { classificationIndex: 3, riskIndex: 5, oracleIndex: 6, triggerIndex: 7 };
const controlRowShape = { classificationIndex: 3, riskIndex: 5, oracleIndex: 6, triggerIndex: 7 };

type CorpusToken = string | Readonly<{ source: string; ledger: string }>;

function sourceToken(token: CorpusToken): string {
  return typeof token === "string" ? token : token.source;
}

function ledgerToken(token: CorpusToken): string {
  return typeof token === "string" ? token : token.ledger;
}

describe("D2 engine Effect corpus", () => {
  it("keeps app-hosted Studio runtime surfaces represented in the runtime ledger", async () => {
    const runtimeLedger = await readFile(runtimeLedgerPath, "utf8");
    const runtimeRows = parseMarkdownRows(runtimeLedger);
    const source = await readSources(
      [
        "apps/mapgen-studio/src/server/studio/engines.ts",
        "apps/mapgen-studio/src/server/studio/context.ts",
        "apps/mapgen-studio/src/server/runInGame/logFailure.ts",
        "apps/mapgen-studio/src/server/runInGame/proofIdentity.ts",
        "apps/mapgen-studio/src/features/liveRuntime/model.ts",
        "apps/mapgen-studio/src/server/mapConfigs/deploy.ts",
        "apps/mapgen-studio/src/server/daemon/daemon.ts",
        "packages/studio-server/src/context.ts",
        "packages/studio-server/src/handler.ts",
        "packages/studio-server/src/runtime.ts",
        "packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts",
        "packages/studio-server/src/operationRuntime/index.ts",
        "packages/studio-server/src/operationRuntime/model.ts",
        "packages/studio-server/src/operationRuntime/ports.ts",
        "packages/studio-server/src/operationRuntime/projection.ts",
        "packages/studio-server/src/operationRuntime/registry.ts",
        "packages/studio-server/src/liveGame/statusRead.ts",
        "packages/studio-server/src/liveGame/watcher.ts",
        "packages/studio-server/src/services/StudioEventHub.ts",
        "packages/studio-server/src/services/Civ7TunerClient.ts",
        "packages/studio-server/src/services/Civ7TunerSession.ts",
      ].map((path) => join(repoRoot, path))
    );
    const deletedLifecycleTokens: CorpusToken[] = [
      "createStudioEngines",
      "StudioEngines",
      "studioOperationQueue",
      "runInGameOperations",
      "saveDeployOperations",
      "runAutoplayEngine",
      "runRunInGameStartEngine",
      "runRunInGameStatusEngine",
      "runSaveDeployEngine",
      "runSaveDeployStatusEngine",
      "currentOperations",
      "createOperationPublisher",
      "publishOperationEvent",
    ];
    const deletedStudioContextMethods = [
      "autoplay",
      "runInGameStart",
      "runInGameStatus",
      "mapConfigSaveDeploy",
      "mapConfigStatus",
      "operationsCurrent",
    ];
    const requiredRuntimeTokens: CorpusToken[] = [
      "createStudioOperationRuntimePorts",
      "StudioOperationRuntime",
      "StudioOperationRuntimePorts",
      "makeStudioOperationRuntimeLayer",
      "SynchronizedRef",
      "Effect.makeSemaphore",
      "FiberSet",
      "operationEvent",
      "operationRuntime",
      "serverInstanceId",
      "serverStartedAt",
      "StudioRuntimeFailure",
      "deploySwooperMaps",
      "generateSwooperRunMod",
      "deployGeneratedSwooperRunMod",
      "buildSwooperMapsStudioDeployPlan",
      "generateRunInGameMod",
      "readStudioRunGenerationManifest",
      "restoreRepoConfig",
      "assertRepoMapEnvelope",
      "snapshotFile",
      "readFreshLogText",
      "waitForFreshLogMarkers",
      "buildRunInGameSourceSnapshotProof",
      "buildRunInGameExactAuthorshipProof",
      "buildLiveRuntimeStatusState",
      "liveRuntimeSnapshot",
      "snapshotId",
      "snapshotHash",
      "gameHash",
      "StudioEventHub",
      "Civ7TunerSession",
      "Civ7TunerClient",
      "createStudioServerContext",
      { source: "civ7Control", ledger: "StudioServerContext.civ7Control" },
      "liveCiv7ControlOrpcDirectControlFacade",
      { source: "directControl:", ledger: "context.civ7Control.directControl" },
      { source: "timeoutMs:", ledger: "context.civ7Control.timeoutMs" },
      "Civ7ControlOrpcRouter",
      "loadCiv7SetupCatalog",
    ];

    for (const token of deletedLifecycleTokens) {
      expect(
        source,
        `${ledgerToken(token)} should no longer exist in the scanned D4 production corpus`
      ).not.toContain(sourceToken(token));
      expectLedgerRow(runtimeRows, ledgerToken(token), runtimeRowShape);
    }
    const contextSource = await readRepoFile("packages/studio-server/src/context.ts");
    for (const method of deletedStudioContextMethods) {
      expect(studioContextMethods(contextSource)).not.toContain(method);
      expectLedgerRow(runtimeRows, `StudioServerContext.${method}`, runtimeRowShape);
    }

    for (const token of requiredRuntimeTokens) {
      expect(
        source,
        `${ledgerToken(token)} should still exist in the scanned D2 source corpus`
      ).toContain(sourceToken(token));
      expectLedgerRow(runtimeRows, ledgerToken(token), runtimeRowShape);
    }
  });

  it("keeps exact corpus rows structurally classified", async () => {
    const runtimeLedger = await readFile(runtimeLedgerPath, "utf8");
    const controlLedger = await readFile(controlLedgerPath, "utf8");
    const runtimeRows = parseMarkdownRows(runtimeLedger);
    const controlRows = parseMarkdownRows(controlLedger);

    for (const row of runtimeRows) {
      expect(row.cells).toHaveLength(8);
      expect(row.cells[3], `runtime row needs classification: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[5], `runtime row needs risk: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[6], `runtime row needs oracle: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[7], `runtime row needs re-entry trigger: ${row.raw}`).toMatch(/\S/);
    }

    for (const row of controlRows) {
      expect(row.cells).toHaveLength(8);
      expect(row.cells[3], `control row needs classification: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[5], `control row needs risk: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[6], `control row needs oracle: ${row.raw}`).toMatch(/\S/);
      expect(row.cells[7], `control row needs re-entry trigger: ${row.raw}`).toMatch(/\S/);
    }
  });

  it("keeps every StudioServerContext host function represented by exact name", async () => {
    const runtimeLedger = await readFile(runtimeLedgerPath, "utf8");
    const runtimeRows = parseMarkdownRows(runtimeLedger);
    const contextSource = await readRepoFile("packages/studio-server/src/context.ts");

    expect(studioContextMethods(contextSource)).toEqual(["loadSetupCatalog"]);
    expect(studioContextProperties(contextSource)).toContain("operationRuntime");

    for (const method of studioContextMethods(contextSource)) {
      expectLedgerRow(runtimeRows, `StudioServerContext.${method}`, runtimeRowShape);
    }
    expectLedgerRow(runtimeRows, "StudioServerContext.operationRuntime", runtimeRowShape);
  });

  it("keeps every production control-oRPC mutation helper declaration classified", async () => {
    const controlLedger = await readFile(controlLedgerPath, "utf8");
    const controlRows = parseMarkdownRows(controlLedger);
    const controlFiles = await collectSourceFiles("packages/civ7-control-orpc/src");
    const controlSource = await readSources(controlFiles);
    const declarations = exportedMutationDeclarations(controlSource);

    expect(declarations).toHaveLength(24);
    for (const declaration of declarations) {
      expectLedgerRow(controlRows, `\`${declaration}\``, controlRowShape);
    }
  });

  it("keeps retained display/view behavior state machines and direct-control atoms classified", async () => {
    const controlLedger = await readFile(controlLedgerPath, "utf8");
    const controlRows = parseMarkdownRows(controlLedger);
    const controlFiles = await collectSourceFiles("packages/civ7-control-orpc/src");
    const directControlFiles = await collectSourceFiles("packages/civ7-direct-control/src");
    const source = await readSources([...controlFiles, ...directControlFiles]);
    const retainedBehaviorTokens = [
      "displayExploreRequestProcedure",
      "displayQueueCurrentProcedure",
      "displayQueueCloseProcedure",
      "viewCameraFocusProcedure",
      "viewAppshotCaptureProcedure",
      "readCiv7DisplayQueue",
      "suspendCiv7DisplayQueue",
      "resumeCiv7DisplayQueue",
      "closeCiv7Displays",
      "applyCiv7ExploreGrant",
      "releaseCiv7ExploreGrant",
      "getCiv7VisibilitySummary",
      "focusCiv7Camera",
      "focusCiv7CameraOnPlot",
      "enterCiv7CleanFrame",
      "exitCiv7CleanFrame",
      "captureCiv7WindowShot",
    ];

    for (const token of retainedBehaviorTokens) {
      expect(source, `${token} should still exist in control/direct-control sources`).toContain(
        token
      );
      expectLedgerRow(controlRows, token, controlRowShape);
    }
  });
});
