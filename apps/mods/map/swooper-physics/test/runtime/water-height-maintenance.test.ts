import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  CIV7_MAP_INFO_KEYS,
  type Civ7StandardMapSizeId,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
} from "@swooper/mapgen-core/lib/log";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core/trace";
import standardRecipe, {
  createUnavailableStandardInitialOptionEvidence,
  projectStandardInitialSetup,
  STANDARD_STAGES,
} from "@swooper/swooper-physics/standard";
import {
  canonicalMapConfigContentDigest,
  canonicalMapConfigDigest,
} from "@swooper/swooper-physics/standard/map-config";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import ts from "typescript";
import {
  buildRiverProbePlan,
  riverProbeMapScript,
  type WaterHeightDiagnosticSelection,
} from "./river-contract-probe.fixture.js";
import {
  installWaterHeightMaintenanceProbe,
  observeWaterHeightPhysicalLakes,
  projectLakeCutoffInitialSetup,
  WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
  WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  WATER_HEIGHT_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_MAINTENANCE_PROBE,
  WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
  WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
} from "./water-height-maintenance.fixture.js";

const identity = {
  configHash: "a".repeat(64),
  envelopeHash: "b".repeat(64),
  fixtureSourceSha256: "c".repeat(64),
};
const selectedSizes = ["MAPSIZE_TINY", "MAPSIZE_STANDARD", "MAPSIZE_HUGE"] as const;
type Adapter = Parameters<typeof installWaterHeightMaintenanceProbe>[0];
type MapInfo = ReturnType<Adapter["lookupMapInfo"]>;
const mapInfo = (cutoff: number, mapSize: Civ7StandardMapSizeId = "MAPSIZE_HUGE"): MapInfo => {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  return {
    MapSizeType: preset.id,
    LakeSizeCutoff: cutoff,
    GridWidth: preset.dimensions.width,
    GridHeight: preset.dimensions.height,
  };
};
function cutoffCapture(
  cutoff = 20,
  mapSize: Civ7StandardMapSizeId = "MAPSIZE_HUGE"
): Parameters<typeof projectLakeCutoffInitialSetup>[0] {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  const aliveMajorPlayerIds = [7, 2, 11];
  return {
    mapSeed: 1018,
    gameSeed: 1018,
    dimensions: preset.dimensions,
    latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    mapSizeId: preset.id,
    mapInfo: { ...preset.mapInfo, LakeSizeCutoff: cutoff },
    aliveMajorPlayerIds,
    startSlotCapacity: {
      west: preset.mapInfo.PlayersLandmass1,
      east: preset.mapInfo.PlayersLandmass2,
      total: preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2,
    },
    options: createUnavailableStandardInitialOptionEvidence(
      "value-unavailable",
      aliveMajorPlayerIds
    ),
  };
}
function fixture(info: MapInfo = mapInfo(10)) {
  const calls: Array<{ method: string; arg?: unknown }> = [];
  const metadataCalls: Array<{ method: string; arg?: unknown }> = [];
  const observedCoordinates: Array<{ x: number; y: number }> = [];
  const lines: string[] = [];
  let height = 10;
  const adapter: Adapter = {
    getMapSizeId: () => {
      metadataCalls.push({ method: "getMapSizeId" });
      return typeof info?.MapSizeType === "string" ? info.MapSizeType : "MAPSIZE_HUGE";
    },
    lookupMapInfo: (id) => {
      metadataCalls.push({ method: "lookupMapInfo", arg: id });
      return info;
    },
    getElevation: (x, y) => {
      observedCoordinates.push({ x, y });
      return height;
    },
    readCurrentMapElevationSnapshot: () => ({
      source: "native",
      status: "available",
      width: info?.GridWidth ?? 106,
      height: info?.GridHeight ?? 66,
      values: new Float64Array((info?.GridWidth ?? 106) * (info?.GridHeight ?? 66)).fill(height),
    }),
    getTerrainType: () => 3,
    getFeatureType: () => -1,
    getRiverType: () => -1,
    isWater: (x) => x === 93,
    isLake: () => false,
    setElevation: (values) => {
      calls.push({ method: "setElevation", arg: values });
      height = 20;
    },
    setRiverInfo: (intent) => {
      calls.push({ method: "setRiverInfo", arg: intent });
    },
    finalizeRivers: (args) => {
      calls.push({ method: "finalizeRivers", arg: args });
      height = 30;
    },
    validateAndFixTerrain: () => {
      calls.push({ method: "validateAndFixTerrain" });
      height++;
    },
    generateCliffsFromElevation: () => {
      calls.push({ method: "generateCliffsFromElevation" });
    },
    recalculateAreas: () => {
      calls.push({ method: "recalculateAreas" });
    },
    storeWaterData: () => {
      calls.push({ method: "storeWaterData" });
    },
  };
  const decode = () =>
    decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]").map(
      (entry) =>
        entry.payload as {
          stage: string;
          proofId: string;
          diagnosticRevision: number;
          atlasKind: string;
          payload: {
            method?: string;
            occurrence?: number;
            points?: Array<{
              elevation: number;
              lake: boolean;
              body?: number;
              role: string;
              x: number;
              y: number;
            }>;
            focus?: Array<{ body?: number; role: string; x: number; y: number }>;
            writes?: Array<{ wet: boolean; intent: unknown }>;
            elevations?: Array<{ count: number; sha256: string }>;
            mapSizeId?: string;
            mapInfo?: MapInfo;
            expectedLakeSizeCutoff?: number;
            observedLakeSizeCutoff?: unknown;
            activation?: string;
            checkpoint?: string;
            row?: number;
            startCell?: number;
            values?: number[];
            elevation?: number[];
            nativeElevation?: number[];
            terrain?: number[];
            feature?: number[];
            riverType?: number[];
            water?: boolean[];
            lake?: boolean[];
            count?: number;
            sha256?: string;
            phase?: string;
            action?: string;
            cellCount?: number;
            rowCount?: number;
            originalInputSha256?: string;
            selection?: string;
          };
        }
    );
  return { adapter, calls, metadataCalls, observedCoordinates, lines, decode };
}

function generatedMaintenanceExecute(
  script: string,
  delegate: typeof standardRecipe.execute,
  observe: typeof observeWaterHeightPhysicalLakes,
  finish?: () => void
): typeof standardRecipe.execute {
  const source = ts.createSourceFile(
    "diagnostic.js",
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );
  const matches: ts.ArrowFunction[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === "execute" &&
      ts.isArrowFunction(node.initializer) &&
      ts.isBlock(node.initializer.body)
    ) {
      const second = node.initializer.body.statements.at(-1);
      if (
        second &&
        ts.isExpressionStatement(second) &&
        ts.isCallExpression(second.expression) &&
        second.expression.expression.getText(source) === "observeWaterHeightPhysicalLakes"
      )
        matches.push(node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  expect(matches).toHaveLength(1);
  const arrow = matches[0]!;
  if (!ts.isBlock(arrow.body)) throw new Error("Expected a generated execute body.");
  expect(arrow.body.statements).toHaveLength(finish ? 3 : 2);
  const first = arrow.body.statements[0]!,
    second = arrow.body.statements.at(-1)!;
  if (
    !ts.isExpressionStatement(first) ||
    !ts.isCallExpression(first.expression) ||
    !ts.isPropertyAccessExpression(first.expression.expression) ||
    !ts.isIdentifier(first.expression.expression.expression) ||
    !ts.isExpressionStatement(second) ||
    !ts.isCallExpression(second.expression) ||
    !ts.isIdentifier(second.expression.expression)
  )
    throw new Error("Unexpected generated diagnostic delegation.");
  expect(first.expression.expression.name.text).toBe("execute");
  expect(first.expression.arguments.map((arg) => arg.getText(source))).toEqual(
    arrow.parameters.map((parameter) => parameter.name.getText(source))
  );
  expect(arrow.parameters).toHaveLength(3);
  let finishingName = "unusedFinishingCallback";
  if (finish) {
    const finishing = arrow.body.statements[1]!;
    if (
      !ts.isExpressionStatement(finishing) ||
      !ts.isCallExpression(finishing.expression) ||
      !ts.isIdentifier(finishing.expression.expression)
    )
      throw new Error("Unexpected generated finishing callback.");
    expect(finishing.expression.arguments).toHaveLength(0);
    finishingName = finishing.expression.expression.text;
  }
  return new Function(
    first.expression.expression.expression.text,
    second.expression.expression.text,
    finishingName,
    `return (${arrow.getText(source)});`
  )({ execute: delegate }, observe, finish);
}

async function physicalLakeRun(
  sourceConfigId = "swooper-earthlike",
  mapSize: Civ7StandardMapSizeId = "MAPSIZE_TINY",
  mapSeed = 42,
  gameSeed = 7331,
  cutoff = getCiv7StandardMapSizePreset(mapSize).mapInfo.LakeSizeCutoff
) {
  const preset = getCiv7StandardMapSizePreset(mapSize);
  const capture = { ...cutoffCapture(cutoff, mapSize), mapSeed, gameSeed };
  const setup = projectLakeCutoffInitialSetup(capture, cutoff, mapSize);
  const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: [sourceConfigId] });
  if (!config) throw new Error("Missing selected physical lake test config.");
  const plan = standardRecipe.compile(setup, config.canonicalConfig.config);
  const adapter = createMockAdapter({
    ...preset.dimensions,
    mapSizeId: preset.id,
    mapInfo: capture.mapInfo,
    aliveMajorPlayerIds: capture.aliveMajorPlayerIds,
    rngSeed: mapSeed,
  });
  const context = createMapContext({ setup: plan.setup, adapter });
  const options = {
    ...WATER_HEIGHT_MAINTENANCE_PROBE,
    ...preset.dimensions,
    mapSize,
    sourceConfigId,
    mapSeed,
    gameSeed,
    playerCount: capture.aliveMajorPlayerIds.length,
    expectedLakeSizeCutoff: cutoff,
  };
  const lakePlanDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (typeof provided !== "string" && provided.id === "artifact:hydrology.lakePlan")
            return provided;
    throw new Error("Missing public lakePlan provider.");
  })();
  const projectedLakesDefinition = (() => {
    for (const stage of STANDARD_STAGES)
      for (const step of stage.steps)
        for (const provided of step.contract.provides)
          if (
            typeof provided !== "string" &&
            provided.id === "artifact:map.hydrology.projectedLakes"
          )
            return provided;
    throw new Error("Missing public projectedLakes provider.");
  })();
  return {
    plan,
    adapter,
    context,
    options,
    lakes: () => readArtifact(context, lakePlanDefinition),
    accepted: () => readArtifact(context, projectedLakesDefinition),
  };
}

describe("post-recipe physical lake maintenance evidence", () => {
  it.each([
    "stock",
    40,
  ] as const)("decorates the actual %s generated execute once with complete terminal evidence", async (cutoff) => {
    const selection = {
      sourceConfigId: "swooper-earthlike",
      mapSize: "MAPSIZE_TINY",
      mapSeed: 42,
      gameSeed: 7331,
      playerCount: 3,
      lakeSizeCutoff: cutoff,
    } as const;
    const built = await buildRiverProbePlan(
      "physical-lakes-test",
      "authored",
      "full-map-maintenance",
      selection
    );
    const script = String(
      built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    );
    const proof = JSON.parse(
      String(built.files.find((file) => file.relativePath === "proof.json")!.content)
    );
    const run = await physicalLakeRun(
      selection.sourceConfigId,
      selection.mapSize,
      selection.mapSeed,
      selection.gameSeed,
      proof.expectedLakeSizeCutoff
    );
    const lines: string[] = [],
      events: string[] = [];
    const executionOptions = { log: () => {} };
    let delegationCount = 0,
      observationCount = 0;
    const execute = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        delegationCount++;
        expect(context).toBe(run.context);
        expect(plan).toBe(run.plan);
        expect(options).toBe(executionOptions);
        standardRecipe.execute(context, plan, options);
        events.push("recipe-returned");
      },
      (context, plan, proofId, identity, options) => {
        observationCount++;
        const before = stableStringify(run.lakes());
        expect(context).toBe(run.context);
        expect(plan).toBe(run.plan);
        observeWaterHeightPhysicalLakes(context, plan, proofId, identity, options, (line) =>
          lines.push(line)
        );
        expect(stableStringify(run.lakes())).toBe(before);
        events.push("physical-lakes");
      }
    );
    const originalLog = console.log;
    try {
      console.log = () => {};
      execute(run.context, run.plan, executionOptions);
    } finally {
      console.log = originalLog;
    }
    events.push("execute-returned");
    expect(delegationCount).toBe(1);
    expect(observationCount).toBe(1);
    expect(events).toEqual(["recipe-returned", "physical-lakes", "execute-returned"]);
    expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    const records = decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]");
    expect(records).toHaveLength(1);
    expect(records[0]!.partCount).toBeGreaterThan(1);
    const lakes = run.lakes(),
      accepted = run.accepted();
    const cells = Array.from(accepted.lakeMask).flatMap((wet, cell) =>
      wet === 1 ? [[cell, lakes.bodyId[cell]!, lakes.waterSurface[cell]!]] : []
    );
    expect(cells.length).toBeGreaterThan(0);
    expect(records[0]!.payload).toEqual({
      proofId: proof.proofId,
      stage: "physical-lakes",
      diagnosticRevision: proof.diagnosticRevision,
      atlasKind: proof.atlasKind,
      configHash: proof.configHash,
      envelopeHash: proof.envelopeHash,
      fixtureSourceSha256: proof.fixtureSourceSha256,
      payload: {
        phase: "post-recipe",
        mapSeed: 42,
        gameSeed: 7331,
        dimensions: run.context.setup.dimensions,
        plannedLakeTileCount: lakes.plannedLakeTileCount,
        columns: ["cell", "body", "head"],
        cells,
        bodies: lakes.bodies
          .map((body) => ({
            bodyId: body.bodyId,
            componentId: body.componentId,
            poolId: body.poolId,
            level: body.level,
            wetCells: [...body.wetCells],
          }))
          .sort((a, b) => a.bodyId - b.bodyId),
        components: lakes.components
          .map((component) => ({
            componentId: component.componentId,
            poolId: component.poolId,
            state: component.state,
            level: component.level,
            bodyIds: [...component.bodyIds],
            memberCells: [...component.memberCells],
          }))
          .sort((a, b) => a.componentId - b.componentId),
        pools: lakes.pools
          .map((pool) => ({
            poolId: pool.poolId,
            componentId: pool.componentId,
            state: pool.state,
            level: pool.level,
            leafIds: [...pool.leafIds],
            wetCells: [...pool.wetCells],
          }))
          .sort((a, b) => a.poolId - b.poolId),
      },
    });
  }, 30_000);

  it("preserves an actual native-boundary failure and emits no physical observation", async () => {
    const built = await buildRiverProbePlan(
      "physical-failure-test",
      "authored",
      "full-map-maintenance",
      { mapSize: "MAPSIZE_TINY", mapSeed: 42, gameSeed: 7331, playerCount: 3 }
    );
    const script = String(
      built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    );
    const run = await physicalLakeRun();
    const failure = new Error("test elevation write failure");
    let calls = 0,
      delegations = 0,
      observations = 0;
    let delegatedFailure: unknown, observedFailure: unknown;
    run.adapter.setElevation = () => {
      calls++;
      throw failure;
    };
    const execute = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        delegations++;
        try {
          standardRecipe.execute(context, plan, options);
        } catch (error) {
          delegatedFailure = error;
          throw error;
        }
      },
      () => {
        observations++;
      }
    );
    const originalLog = console.log;
    try {
      console.log = () => {};
      try {
        execute(run.context, run.plan, { log: () => {} });
      } catch (error) {
        observedFailure = error;
      }
    } finally {
      console.log = originalLog;
    }
    expect(observedFailure).toBeInstanceOf(Error);
    expect(observedFailure).toBe(delegatedFailure);
    expect((observedFailure as Error & { cause: unknown }).cause).toBe(failure);
    expect(calls).toBe(1);
    expect(delegations).toBe(1);
    expect(observations).toBe(0);
  }, 30_000);

  it("retains an authentic empty Archipelago footprint and its physical pool/component records", async () => {
    const run = await physicalLakeRun("sundered-archipelago", "MAPSIZE_HUGE", 1018, 1018);
    const originalLog = console.log;
    try {
      console.log = () => {};
      standardRecipe.execute(run.context, run.plan, { log: () => {} });
    } finally {
      console.log = originalLog;
    }
    const lines: string[] = [];
    observeWaterHeightPhysicalLakes(
      run.context,
      run.plan,
      "empty-physical-lakes",
      identity,
      run.options,
      (line) => lines.push(line)
    );
    const lakes = run.lakes();
    expect(lakes.plannedLakeTileCount).toBe(0);
    const record = decodeBoundedJsonLogSeries(lines, "[water-height-maintenance]")[0]!;
    expect(record.payload).toMatchObject({
      stage: "physical-lakes",
      payload: {
        phase: "post-recipe",
        plannedLakeTileCount: 0,
        cells: [],
        bodies: [],
        components: lakes.components
          .map((component) => ({
            componentId: component.componentId,
            poolId: component.poolId,
            state: component.state,
            level: component.level,
            bodyIds: [...component.bodyIds],
            memberCells: [...component.memberCells],
          }))
          .sort((a, b) => a.componentId - b.componentId),
        pools: lakes.pools
          .map((pool) => ({
            poolId: pool.poolId,
            componentId: pool.componentId,
            state: pool.state,
            level: pool.level,
            leafIds: [...pool.leafIds],
            wetCells: [...pool.wetCells],
          }))
          .sort((a, b) => a.poolId - b.poolId),
      },
    });
  }, 30_000);

  it("refuses a fresh context or mismatched diagnostic selection without success evidence", async () => {
    const run = await physicalLakeRun();
    const lines: string[] = [];
    const observe = (options = run.options, context = run.context) =>
      observeWaterHeightPhysicalLakes(
        context,
        run.plan,
        "invalid-physical-lakes",
        identity,
        options,
        (line) => lines.push(line)
      );
    expect(() => observe()).toThrow("completed");
    expect(() => observe({ ...run.options, gameSeed: 7332 })).toThrow("exact selected recipe plan");
    expect(() => observe({ ...run.options, mapSeed: 43 })).toThrow("exact selected recipe plan");
    expect(() => observe({ ...run.options, width: run.options.width - 1 })).toThrow(
      "exact selected recipe plan"
    );
    const other = await physicalLakeRun();
    expect(() => observe(run.options, other.context)).toThrow("exact selected recipe plan");
    expect(lines).toEqual([]);
  });
});

describe("V18-V20 post-recipe input transport (not native preservation)", () => {
  const preset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
  const selection = {
    ...preset.dimensions,
    mapSize: preset.id,
    playerCount: preset.defaultPlayers,
    expectedLakeSizeCutoff: preset.mapInfo.LakeSizeCutoff,
  };

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_PROBE,
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
  ])("protects first-setter Number requests and observes both finishing slots in V%s", (probe) => {
    const options = { ...probe, ...selection };
    const replay = probe.atlasKind === WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS;
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const requests = Array.from({ length: options.width * options.height }, () => 638);
    requests[1] = Math.PI;
    const original = [...requests];
    let native = [...requests];
    const supplied: Array<Parameters<Adapter["setElevation"]>[0]> = [];
    const suppliedCopies: number[][] = [];
    run.adapter.readCurrentMapElevationSnapshot = () => {
      throw new Error("V18/V19 must not read the V20 input snapshot.");
    };
    run.adapter.getElevation = (x, y) => native[x + y * options.width]!;
    run.adapter.getFeatureType = (x, y) => (x === 0 && y === 0 ? 77 : -1);
    run.adapter.setElevation = (values) => {
      run.calls.push({ method: "setElevation", arg: values });
      supplied.push(values);
      suppliedCopies.push([...values]);
      native = [...values];
      if (supplied.length === 1) native[0] = 598;
      Reflect.set(values, 0, -999);
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "original-input-test",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(requests);
    run.adapter.validateAndFixTerrain();
    const genuineCalls = [...run.calls];
    finish();
    expect(supplied).toHaveLength(replay ? 2 : 1);
    expect(supplied[0]).toBe(requests);
    if (replay) {
      expect(supplied[1]).not.toBe(requests);
      expect(suppliedCopies[1]).toEqual(original);
    }
    expect(run.calls.slice(0, genuineCalls.length)).toEqual(genuineCalls);
    expect(run.calls.slice(genuineCalls.length).map((call) => call.method)).toEqual(
      replay ? ["setElevation"] : []
    );
    const records = run.decode();
    const inputs = records.filter((record) => record.stage === "original-elevation-input-grid");
    expect(inputs).toHaveLength(options.height);
    expect(inputs.flatMap((record) => record.payload.values ?? [])).toEqual(original);
    expect(records.filter((record) => record.stage.startsWith("dry-retention-input"))).toEqual([]);
    expect(
      records.find((record) => record.stage === "original-elevation-input")?.payload
    ).toMatchObject({
      count: original.length,
      sha256: sha256Hex(stableStringify(original)),
    });
    for (const checkpoint of ["before-original-replay", "after-original-replay"]) {
      const rows = records.filter(
        (record) =>
          record.stage === "original-replay-grid" && record.payload.checkpoint === checkpoint
      );
      expect(rows).toHaveLength(options.height);
      rows.forEach((record, row) => {
        expect(record.payload.row).toBe(row);
        expect(record.payload.startCell).toBe(row * options.width);
        for (const field of [
          "elevation",
          "terrain",
          "feature",
          "riverType",
          "water",
          "lake",
        ] as const)
          expect(record.payload[field]).toHaveLength(options.width);
      });
      expect(rows[0]?.payload.elevation?.slice(0, 2)).toEqual([
        checkpoint === "after-original-replay" && replay ? 638 : 598,
        Math.PI,
      ]);
      expect(rows[0]?.payload.feature?.[0]).toBe(77);
      expect(records.find((record) => record.stage === checkpoint)?.payload).toMatchObject({
        phase: "post-authentic-recipe",
        action: replay ? "replay-original-requests" : "none",
        cellCount: original.length,
        rowCount: options.height,
        originalInputSha256: sha256Hex(stableStringify(original)),
      });
    }
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    const callCount = run.calls.length;
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(callCount);
  });

  it("constructs detached V20 requests from exact dry heights and only original wet inputs", () => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const requests = Array<number>(options.width * options.height).fill(638);
    requests.splice(0, 8, 638, 228, 129, 1, 0, 777.25, -4.125, 300);
    const original = [...requests];
    let native = Float64Array.from(requests);
    const supplied: Array<Parameters<Adapter["setElevation"]>[0]> = [];
    const suppliedCopies: number[][] = [];
    let snapshotReads = 0;
    run.adapter.getElevation = (x, y) => native[x + y * options.width]!;
    run.adapter.getFeatureType = (x, y) => (x === 0 && y === 0 ? 77 : -1);
    run.adapter.getRiverType = (x, y) => (x === 1 && y === 0 ? 9 : -1);
    run.adapter.isWater = (x, y) => y === 0 && x >= 4 && x <= 6;
    // A contradictory dry lake flag proves that isLake cannot choose setter inputs.
    run.adapter.isLake = (x, y) => y === 0 && (x === 0 || x === 5);
    run.adapter.readCurrentMapElevationSnapshot = () => {
      snapshotReads++;
      return {
        source: "native",
        status: "available",
        width: options.width,
        height: options.height,
        values: native,
      };
    };
    run.adapter.setElevation = (values) => {
      run.calls.push({ method: "setElevation", arg: values });
      supplied.push(values);
      suppliedCopies.push([...values]);
      native = Float64Array.from(values);
      Reflect.set(values, 0, -999);
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-input",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(requests);
    native.set([598, -7.5, 127.25, 0, 17, 43, 0, Math.PI]);
    const retainedSnapshotValues = native;
    const before = Array.from(native);
    const expected = [...before];
    for (const cell of [4, 5, 6]) expected[cell] = original[cell]!;
    finish();
    expect(snapshotReads).toBe(1);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation", "setElevation"]);
    expect(supplied).toHaveLength(2);
    expect(supplied[0]).toBe(requests);
    expect(supplied[1]).not.toBe(requests);
    expect(supplied[1]).not.toBe(retainedSnapshotValues);
    expect(Array.isArray(supplied[1])).toBe(true);
    expect(suppliedCopies[1]).toEqual(expected);
    expect(Array.from(retainedSnapshotValues)).toEqual(before);
    expect(Array.from(native)).toEqual(expected);
    const records = run.decode();
    expect(
      records
        .filter((record) => record.stage === "original-elevation-input-grid")
        .flatMap((record) => record.payload.values ?? [])
    ).toEqual(original);
    const inputRows = records.filter((record) => record.stage === "dry-retention-input-grid");
    expect(inputRows).toHaveLength(options.height);
    inputRows.forEach((record, row) => {
      expect(record.payload.row).toBe(row);
      expect(record.payload.startCell).toBe(row * options.width);
      for (const field of ["values", "nativeElevation", "water"] as const)
        expect(record.payload[field]).toHaveLength(options.width);
    });
    expect(inputRows.flatMap((record) => record.payload.values ?? [])).toEqual(expected);
    expect(inputRows.flatMap((record) => record.payload.nativeElevation ?? [])).toEqual(before);
    expect(inputRows.flatMap((record) => record.payload.water ?? [])).toEqual(
      original.map((_, cell) => cell >= 4 && cell <= 6)
    );
    expect(records.find((record) => record.stage === "dry-retention-input")?.payload).toMatchObject(
      {
        phase: "post-authentic-recipe",
        source: "native",
        dimensions: preset.dimensions,
        count: original.length,
        rowCount: options.height,
        sha256: sha256Hex(stableStringify(expected)),
        originalInputSha256: sha256Hex(stableStringify(original)),
        selection:
          "isWater=true: protected original request; isWater=false: exact current native elevation; isLake is not a selector",
      }
    );
    for (const checkpoint of ["before-original-replay", "after-original-replay"]) {
      const rows = records.filter(
        (record) =>
          record.stage === "original-replay-grid" && record.payload.checkpoint === checkpoint
      );
      expect(rows).toHaveLength(options.height);
      expect(rows.flatMap((record) => record.payload.elevation ?? [])).toEqual(
        checkpoint === "before-original-replay" ? before : expected
      );
      expect(rows[0]?.payload.feature?.[0]).toBe(77);
      expect(rows[0]?.payload.riverType?.[1]).toBe(9);
      expect(records.find((record) => record.stage === checkpoint)?.payload.action).toBe(
        "replay-original-wet-retain-native-dry"
      );
    }
    const addedBefore = records.findIndex(
      (record) =>
        record.stage === "before" && record.payload.method === "setElevation-dry-retention-replay"
    );
    expect(addedBefore).toBeGreaterThan(
      records.findIndex((record) => record.stage === "dry-retention-input")
    );
    expect(addedBefore).toBeGreaterThan(
      records.findIndex((record) => record.stage === "before-original-replay")
    );
    expect(run.lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(() => finish()).toThrow("already attempted");
    expect(supplied).toHaveLength(2);
  });

  it.each([
    "unavailable",
    "mock",
    "unknown-source",
    "unknown-status",
    "missing-snapshot",
    "missing-method",
    "non-finite",
    "infinite",
    "truncated",
    "overlong",
    "width",
    "height",
    "non-exact-storage",
  ])("refuses V20 %s snapshot before the added setter without original fallback", (invalid) => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const current = {
      source: "native" as const,
      status: "available" as const,
      width: options.width,
      height: options.height,
      values: new Float64Array(options.width * options.height).fill(598),
    };
    if (invalid === "unavailable") Reflect.set(current, "status", "unavailable");
    if (invalid === "mock") Reflect.set(current, "source", "mock");
    if (invalid === "unknown-source") Reflect.set(current, "source", "unknown");
    if (invalid === "unknown-status") Reflect.set(current, "status", "partial");
    if (invalid === "non-finite") current.values[current.values.length - 1] = Number.NaN;
    if (invalid === "infinite")
      current.values[current.values.length - 1] = Number.POSITIVE_INFINITY;
    if (invalid === "truncated") current.values = current.values.slice(0, -1);
    if (invalid === "overlong") current.values = new Float64Array(current.values.length + 1);
    if (invalid === "width") current.width++;
    if (invalid === "height") current.height++;
    if (invalid === "non-exact-storage") Reflect.set(current, "values", Array.from(current.values));
    run.adapter.readCurrentMapElevationSnapshot = () => current;
    if (invalid === "missing-snapshot")
      Reflect.set(run.adapter, "readCurrentMapElevationSnapshot", () => undefined);
    if (invalid === "missing-method")
      Reflect.set(run.adapter, "readCurrentMapElevationSnapshot", undefined);
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-refused",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    expect(() => finish()).toThrow("Dry retention requires");
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "dry-retention-input")).toEqual([]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(1);
  });

  it.each([
    0,
    1,
    undefined,
    null,
    {},
    "false",
  ])("refuses V20 nonboolean water %j across the complete grid", (invalid) => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    Reflect.set(run.adapter, "isWater", (x: number, y: number) =>
      x === options.width - 1 && y === options.height - 1 ? invalid : false
    );
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-water-refused",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    expect(() => finish()).toThrow(
      `native boolean water observation at cell ${options.width * options.height - 1}`
    );
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "dry-retention-input-grid")).toEqual(
      []
    );
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
    expect(run.calls).toHaveLength(1);
  });

  it("preserves a V20 snapshot failure without fallback, retry or added maintenance", () => {
    const options = { ...WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("native elevation snapshot failed");
    run.adapter.readCurrentMapElevationSnapshot = () => {
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "dry-retention-snapshot-failed",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observed: unknown;
    try {
      finish();
    } catch (error) {
      observed = error;
    }
    expect(observed).toBe(failure);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(() => finish()).toThrow("already attempted");
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  ])("preserves V%s replay setter failure without retries, after evidence or extra maintenance", (probe) => {
    const options = { ...probe, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("replay setter failure");
    let calls = 0;
    run.adapter.setElevation = () => {
      calls++;
      if (calls === 2) throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-replay",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observedFailure: unknown;
    try {
      finish();
    } catch (error) {
      observedFailure = error;
    }
    expect(observedFailure).toBe(failure);
    expect(calls).toBe(2);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
    expect(run.decode().filter((record) => record.stage === "original-replay-failed")).toHaveLength(
      1
    );
    expect(() => finish()).toThrow("already attempted");
    expect(calls).toBe(2);
    expect(run.calls).toEqual([]);
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_PROBE,
  ])("requires a successful authentic setter and preserves V%s first-setter failure", (probe) => {
    const options = { ...probe, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("authentic setter failure");
    let calls = 0;
    run.adapter.setElevation = () => {
      calls++;
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-authentic",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    expect(() => finish()).toThrow("successful authentic elevation setter");
    expect(() => run.adapter.setElevation(Array(options.width * options.height).fill(638))).toThrow(
      failure
    );
    expect(() => finish()).toThrow("successful authentic elevation setter");
    expect(calls).toBe(1);
    expect(run.decode().filter((record) => record.stage === "original-replay-grid")).toEqual([]);
  });

  it("refuses incomplete native finishing observations without replaying", () => {
    const options = { ...WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_PROBE, ...selection };
    const run = fixture(mapInfo(options.expectedLakeSizeCutoff, options.mapSize));
    const failure = new Error("feature observation unavailable");
    run.adapter.getFeatureType = () => {
      throw failure;
    };
    const finish = installWaterHeightMaintenanceProbe(
      run.adapter,
      "failed-observation",
      identity,
      options,
      (line) => run.lines.push(line)
    );
    run.adapter.setElevation(Array(options.width * options.height).fill(638));
    let observedFailure: unknown;
    try {
      finish();
    } catch (error) {
      observedFailure = error;
    }
    expect(observedFailure).toBe(failure);
    expect(run.calls.map((call) => call.method)).toEqual(["setElevation"]);
    expect(run.decode().filter((record) => record.stage === "after-original-replay")).toEqual([]);
  });

  it.each([
    WATER_HEIGHT_ORIGINAL_INPUT_CONTROL_ATLAS,
    WATER_HEIGHT_ORIGINAL_INPUT_REPLAY_ATLAS,
    WATER_HEIGHT_DRY_RETENTION_REPLAY_ATLAS,
  ] as const)("finishes only after authentic generated recipe success for %s", async (atlas) => {
    const built = await buildRiverProbePlan("original-execute", "authored", atlas, {
      mapSize: "MAPSIZE_TINY",
      mapSeed: 42,
      gameSeed: 7331,
      playerCount: 3,
    });
    const script = String(
      built.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    );
    const run = await physicalLakeRun();
    const events: string[] = [];
    const execute = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        standardRecipe.execute(context, plan, options);
        events.push("authentic-returned");
      },
      () => {
        events.push("physical-lakes");
      },
      () => {
        events.push("finishing-slot");
      }
    );
    const originalLog = console.log;
    try {
      console.log = () => {};
      execute(run.context, run.plan, { log: () => {} });
    } finally {
      console.log = originalLog;
    }
    expect(events).toEqual(["authentic-returned", "finishing-slot", "physical-lakes"]);

    const failedRun = await physicalLakeRun();
    const failure = new Error("authentic native boundary failure");
    failedRun.adapter.setElevation = () => {
      throw failure;
    };
    let delegatedFailure: unknown;
    let finishingCalls = 0,
      observations = 0;
    const failing = generatedMaintenanceExecute(
      script,
      (context, plan, options) => {
        try {
          standardRecipe.execute(context, plan, options);
        } catch (error) {
          delegatedFailure = error;
          throw error;
        }
      },
      () => {
        observations++;
      },
      () => {
        finishingCalls++;
      }
    );
    let observedFailure: unknown;
    try {
      console.log = () => {};
      try {
        failing(failedRun.context, failedRun.plan, { log: () => {} });
      } catch (error) {
        observedFailure = error;
      }
    } finally {
      console.log = originalLog;
    }
    expect(observedFailure).toBe(delegatedFailure);
    expect(observedFailure).toHaveProperty("cause", failure);
    expect(finishingCalls).toBe(0);
    expect(observations).toBe(0);
  }, 30_000);
});

describe("water height maintenance observation (not native semantics)", () => {
  it.each([
    20, 6996, 40,
  ])("admits the actual cutoff %s through custom selection without weakening official preset admission", async (cutoff) => {
    const capture = cutoffCapture(cutoff);
    const before = structuredClone(capture);
    const official = projectStandardInitialSetup(capture);
    const diagnostic = projectLakeCutoffInitialSetup(capture, cutoff);
    expect(diagnostic).toEqual({
      ...official,
      map: { ...official.map, selection: { ...official.map.selection, kind: "custom" } },
    });
    expect(diagnostic.map.selection.mapInfo.LakeSizeCutoff).toBe(cutoff);
    expect(capture.mapInfo).toEqual(diagnostic.map.selection.mapInfo);
    expect(capture).toEqual(before);
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: ["swooper-earthlike"] });
    expect(() => standardRecipe.compileConfig(official, config!.canonicalConfig.config)).toThrow(
      "mapInfo.LakeSizeCutoff"
    );
    expect(() =>
      standardRecipe.compileConfig(diagnostic, config!.canonicalConfig.config)
    ).not.toThrow();
  });

  it.each([
    20, 6996, 40,
  ])("refuses every other official static field drift and non-Huge capture for cutoff %s", (cutoff) => {
    for (const key of CIV7_MAP_INFO_KEYS) {
      const capture = cutoffCapture(cutoff);
      const value = capture.mapInfo[key];
      const changed =
        typeof value === "number"
          ? value + 1
          : typeof value === "boolean"
            ? !value
            : `${String(value)}-drift`;
      expect(() =>
        projectLakeCutoffInitialSetup(
          { ...capture, mapInfo: { ...capture.mapInfo, [key]: changed } },
          cutoff
        )
      ).toThrow();
    }
    const capture = cutoffCapture(cutoff);
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, dimensions: { ...capture.dimensions, width: 105 } },
        cutoff
      )
    ).toThrow("Huge selection");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, startSlotCapacity: { ...capture.startSlotCapacity, total: 11 } },
        cutoff
      )
    ).toThrow("Huge start-slot capacity");
    expect(() =>
      projectLakeCutoffInitialSetup({ ...capture, mapSizeId: "MAPSIZE_STANDARD" }, cutoff)
    ).toThrow("disagrees");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, mapInfo: { ...capture.mapInfo, LakeSizeCutoff: 10 } },
        cutoff
      )
    ).toThrow(`LakeSizeCutoff=${cutoff}`);
    expect(() => projectLakeCutoffInitialSetup(capture, 100)).toThrow("LakeSizeCutoff=100");
  });

  it("keeps the V11 projector default at 20 and defines V12 from the Huge cell count", () => {
    expect(
      projectLakeCutoffInitialSetup(cutoffCapture()).map.selection.mapInfo.LakeSizeCutoff
    ).toBe(20);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(6996))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE.expectedLakeSizeCutoff).toBe(106 * 66);
    expect(() => projectLakeCutoffInitialSetup(cutoffCapture(40))).toThrow("LakeSizeCutoff=20");
    expect(WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE).toEqual({
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      diagnosticRevision: 15,
      displayLabel: "Water Bounded Lake Cutoff V15",
      atlasKind: "full-map-bounded-lake-cutoff",
      expectedLakeSizeCutoff: 40,
    });
  });

  it.each([
    ...selectedSizes,
  ])("preserves the complete %s capture and changes only the treatment kind", (mapSize) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const capture = { ...cutoffCapture(100, mapSize), mapSeed: -42, gameSeed: 7331 };
    const before = structuredClone(capture);
    const official = projectStandardInitialSetup(capture);
    const diagnostic = projectLakeCutoffInitialSetup(capture, 100, mapSize);
    expect(diagnostic).toEqual({
      ...official,
      map: { ...official.map, selection: { ...official.map.selection, kind: "custom" } },
    });
    expect(capture).toEqual(before);
    expect(
      CIV7_MAP_INFO_KEYS.filter(
        (key) => diagnostic.map.selection.mapInfo[key] !== preset.mapInfo[key]
      )
    ).toEqual(["LakeSizeCutoff"]);
    const stock = cutoffCapture(preset.mapInfo.LakeSizeCutoff, mapSize);
    expect(projectLakeCutoffInitialSetup(stock, preset.mapInfo.LakeSizeCutoff, mapSize)).toEqual(
      projectStandardInitialSetup(stock)
    );
    expect(
      projectLakeCutoffInitialSetup(stock, preset.mapInfo.LakeSizeCutoff, mapSize).map.selection
        .kind
    ).toBe("civ7-preset");
    const cells = preset.dimensions.width * preset.dimensions.height;
    expect(
      projectLakeCutoffInitialSetup(cutoffCapture(cells, mapSize), cells, mapSize).map.selection
        .mapInfo.LakeSizeCutoff
    ).toBe(cells);
    for (const cutoff of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, cells + 1])
      expect(() => projectLakeCutoffInitialSetup(capture, cutoff, mapSize)).toThrow(
        "positive integer"
      );
    for (const key of CIV7_MAP_INFO_KEYS) {
      const value = capture.mapInfo[key];
      const changed =
        typeof value === "number"
          ? value + 1
          : typeof value === "boolean"
            ? !value
            : `${String(value)}-drift`;
      expect(() =>
        projectLakeCutoffInitialSetup(
          { ...capture, mapInfo: { ...capture.mapInfo, [key]: changed } },
          100,
          mapSize
        )
      ).toThrow();
    }
    expect(() => projectLakeCutoffInitialSetup(capture, 99, mapSize)).toThrow("LakeSizeCutoff=99");
    expect(() =>
      projectLakeCutoffInitialSetup(
        { ...capture, dimensions: { ...preset.dimensions, width: preset.dimensions.width - 1 } },
        100,
        mapSize
      )
    ).toThrow("selection and dimensions");
    for (const key of ["west", "east", "total"] as const)
      expect(() =>
        projectLakeCutoffInitialSetup(
          {
            ...capture,
            startSlotCapacity: {
              ...capture.startSlotCapacity,
              [key]: capture.startSlotCapacity[key] + 1,
            },
          },
          100,
          mapSize
        )
      ).toThrow("start-slot capacity");
    const otherSize = mapSize === "MAPSIZE_HUGE" ? "MAPSIZE_TINY" : "MAPSIZE_HUGE";
    expect(() => projectLakeCutoffInitialSetup(capture, 100, otherSize)).toThrow(
      "selection and dimensions"
    );
  });

  it.each([
    42, 1018, 1234,
  ])("admits cutoff40 unchanged for seed %s without a per-seed gate", (seed) => {
    const capture = { ...cutoffCapture(40), mapSeed: seed, gameSeed: seed };
    const setup = projectLakeCutoffInitialSetup(capture, 40);
    expect(setup.map.selection.kind).toBe("custom");
    expect(setup.map.selection.mapInfo.LakeSizeCutoff).toBe(40);
    expect(capture.mapSeed).toBe(seed);
    expect(capture.gameSeed).toBe(seed);
  });

  it.each([
    WATER_HEIGHT_MAINTENANCE_PROBE,
    WATER_HEIGHT_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  ])("preserves admitted call order, arguments and count for $atlasKind", (options) => {
    const info = mapInfo(options.expectedLakeSizeCutoff);
    const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
    installWaterHeightMaintenanceProbe(adapter, "maintenance-test", identity, options, (line) =>
      lines.push(line)
    );
    expect(metadataCalls).toHaveLength(0);
    const values = Array(6996).fill(20);
    const dry = { x: 92, y: 34, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    const wet = { ...dry, x: 93 };
    const args = [false, 25, 2, 2] as const;
    adapter.setElevation(values);
    adapter.setRiverInfo(dry);
    adapter.setRiverInfo(wet);
    adapter.finalizeRivers(args);
    adapter.validateAndFixTerrain();
    adapter.generateCliffsFromElevation();
    adapter.recalculateAreas();
    adapter.storeWaterData();
    adapter.validateAndFixTerrain();
    expect(calls.map((call) => call.method)).toEqual([
      "setElevation",
      "setRiverInfo",
      "setRiverInfo",
      "finalizeRivers",
      "validateAndFixTerrain",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
      "validateAndFixTerrain",
    ]);
    expect(calls[0]!.arg).toBe(values);
    expect(calls[1]!.arg).toBe(dry);
    expect(calls[2]!.arg).toBe(wet);
    expect(calls[3]!.arg).toBe(args);
    const records = decode();
    expect(records.every((record) => record.proofId === "maintenance-test")).toBe(true);
    expect(
      records.every(
        (record) =>
          record.diagnosticRevision === options.diagnosticRevision &&
          record.atlasKind === options.atlasKind
      )
    ).toBe(true);
    expect(metadataCalls).toEqual([
      { method: "getMapSizeId" },
      { method: "lookupMapInfo", arg: "MAPSIZE_HUGE" },
    ]);
    expect(
      records.filter((record) => record.stage === "map-info").map((record) => record.payload)
    ).toEqual([
      {
        mapSizeId: "MAPSIZE_HUGE",
        mapInfo: info,
        expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        observedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        activation: "accepted",
      },
    ]);
    const validations = records.filter(
      (record) => record.payload.method === "validateAndFixTerrain"
    );
    expect(
      validations.map((record) => [
        record.stage,
        record.payload.occurrence,
        record.payload.points?.[0]?.elevation,
      ])
    ).toEqual([
      ["before", 1, 30],
      ["after", 1, 31],
      ["before", 2, 31],
      ["after", 2, 32],
    ]);
    const inputs = records.find((record) => record.stage === "inputs")!.payload;
    expect(inputs.writes).toEqual([
      { wet: false, intent: dry },
      { wet: true, intent: wet },
    ]);
    expect(inputs.elevations?.[0]).toMatchObject({ count: 6996 });
    expect(inputs.elevations?.[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    const legacyLogDigests: Record<string, string> = {
      "full-map-maintenance": "0120dd662a7f6502bf78ce291b292f6c1d4cc1ca188840a53c9102217e2b7bf4",
      "full-map-lake-cutoff": "678067441c3d8db02518d486e461d1592a3adc00f7f0fd744ea45d2725da8e49",
      "full-map-max-lake-cutoff":
        "379f3e3aa6147464702457d60776aae3ab38f67bd7fa4d1d95c00bf6a2f9957c",
    };
    if (legacyLogDigests[options.atlasKind])
      expect(sha256Hex(stableStringify(records))).toBe(legacyLogDigests[options.atlasKind]);
  });

  it("observes changed lake identity without refusing or changing repeated maintenance calls in V12", () => {
    const { adapter, calls, lines, decode } = fixture(mapInfo(6996));
    adapter.isLake = () => true;
    installWaterHeightMaintenanceProbe(
      adapter,
      "marine-discriminator",
      identity,
      WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
      (line) => lines.push(line)
    );
    for (let call = 0; call < 17; call++) adapter.validateAndFixTerrain();
    expect(calls).toEqual(Array.from({ length: 17 }, () => ({ method: "validateAndFixTerrain" })));
    const observations = decode().filter(
      (record) => record.stage === "before" || record.stage === "after"
    );
    expect(observations).toHaveLength(34);
    expect(
      observations.every((record) => record.payload.points?.every((point) => point.lake))
    ).toBe(true);
    expect(decode().find((record) => record.stage === "map-info")!.payload.activation).toBe(
      "accepted"
    );
  });

  it.each([
    { mapSeed: 42, gameSeed: 42 },
    { mapSeed: 1018, gameSeed: 42 },
  ])("uses fixed-coordinate controls without seed1018 hydraulic claims for $mapSeed/$gameSeed", (seeds) => {
    const reference = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(
      reference.adapter,
      "reference-focus",
      identity,
      WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
      (line) => reference.lines.push(line)
    );
    const referenceFocus = reference.decode()[0]!.payload.focus!;
    const expectedFocus = referenceFocus.map(({ x, y }) => ({
      role: "fixed-coordinate-control",
      x,
      y,
    }));
    const observed = fixture(mapInfo(40));
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "seeded-focus",
      identity,
      { ...WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, ...seeds },
      (line) => observed.lines.push(line)
    );
    expect(observed.decode()[0]!.payload.focus).toEqual(expectedFocus);
    observed.adapter.validateAndFixTerrain();
    expect(observed.calls).toEqual([{ method: "validateAndFixTerrain" }]);
    const snapshots = observed
      .decode()
      .filter((record) => record.stage === "before" || record.stage === "after");
    expect(snapshots).toHaveLength(2);
    for (const record of snapshots) {
      const points = record.payload.points!;
      expect(points.map(({ role, x, y }) => ({ role, x, y }))).toEqual(expectedFocus);
      expect(points.every((point) => !Object.hasOwn(point, "body"))).toBe(true);
    }
  });

  it.each([
    ...selectedSizes,
  ])("bounds all %s observer coordinates while preserving original calls and failures", (mapSize) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const options = {
      ...WATER_HEIGHT_MAINTENANCE_PROBE,
      mapSize,
      ...preset.dimensions,
      mapSeed: -42,
      gameSeed: 7331,
      playerCount: preset.defaultPlayers,
      expectedLakeSizeCutoff: preset.mapInfo.LakeSizeCutoff,
    };
    const observed = fixture(mapInfo(options.expectedLakeSizeCutoff, mapSize));
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "bounded-observer",
      identity,
      options,
      (line) => observed.lines.push(line)
    );
    const points = observed.decode()[0]!.payload.focus!;
    expect(points.length).toBeGreaterThan(0);
    expect(
      points.every(
        (point) => point.role === "fixed-coordinate-control" && !Object.hasOwn(point, "body")
      )
    ).toBe(true);
    const values = Array(preset.dimensions.width * preset.dimensions.height).fill(20);
    const intent = { x: 10, y: 10, direction: "WEST", riverClass: "NAVIGABLE" } as const;
    const args = [false, 25, 2, 2] as const;
    observed.adapter.setElevation(values);
    observed.adapter.setRiverInfo(intent);
    observed.adapter.finalizeRivers(args);
    observed.adapter.validateAndFixTerrain();
    observed.adapter.generateCliffsFromElevation();
    observed.adapter.recalculateAreas();
    observed.adapter.storeWaterData();
    expect(observed.calls.map(({ method }) => method)).toEqual([
      "setElevation",
      "setRiverInfo",
      "finalizeRivers",
      "validateAndFixTerrain",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(observed.calls[0]!.arg).toBe(values);
    expect(observed.calls[1]!.arg).toBe(intent);
    expect(observed.calls[2]!.arg).toBe(args);
    expect(
      observed.observedCoordinates.every(
        ({ x, y }) =>
          x >= 0 && y >= 0 && x < preset.dimensions.width && y < preset.dimensions.height
      )
    ).toBe(true);
    expect(
      observed.decode().find((record) => record.stage === "map-info")!.payload.activation
    ).toBe("accepted");
    const failure = fixture(mapInfo(options.expectedLakeSizeCutoff, mapSize));
    const sentinel = new Error("original native failure");
    let attempts = 0;
    failure.adapter.finalizeRivers = (received) => {
      expect(received).toBe(args);
      attempts++;
      throw sentinel;
    };
    installWaterHeightMaintenanceProbe(
      failure.adapter,
      "bounded-failure",
      identity,
      options,
      (line) => failure.lines.push(line)
    );
    let thrown: unknown;
    try {
      failure.adapter.finalizeRivers(args);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBe(sentinel);
    expect(attempts).toBe(1);
    expect(failure.decode().map(({ stage }) => stage)).toEqual([
      "installed",
      "map-info",
      "inputs",
      "before",
      "failed",
    ]);
  });

  it.each([
    { sourceConfigId: "sundered-archipelago" },
    { playerCount: 2 },
  ])("uses no body identities outside the exact historical profile/player selection %j", (selection) => {
    const observed = fixture();
    installWaterHeightMaintenanceProbe(
      observed.adapter,
      "different-selection",
      identity,
      { ...WATER_HEIGHT_MAINTENANCE_PROBE, ...selection },
      (line) => observed.lines.push(line)
    );
    expect(
      observed
        .decode()[0]!
        .payload.focus!.every(
          (point) => point.role === "fixed-coordinate-control" && !Object.hasOwn(point, "body")
        )
    ).toBe(true);
  });

  it("preserves an original failure without retries or a successful after observation", () => {
    const { adapter, lines, decode } = fixture();
    const error = new Error("native failure");
    let calls = 0;
    adapter.validateAndFixTerrain = () => {
      calls++;
      throw error;
    };
    installWaterHeightMaintenanceProbe(
      adapter,
      "maintenance-test",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => lines.push(line)
    );
    expect(() => adapter.validateAndFixTerrain()).toThrow(error);
    expect(calls).toBe(1);
    expect(decode().map((record) => record.stage)).toEqual([
      "installed",
      "map-info",
      "before",
      "failed",
    ]);
  });

  it("refuses invalid activation before any first original call, without converting retries into success", () => {
    const firstCalls: Array<(adapter: Adapter) => void> = [
      (adapter) => adapter.setElevation([20]),
      (adapter) =>
        adapter.setRiverInfo({ x: 93, y: 34, direction: "WEST", riverClass: "NAVIGABLE" }),
      (adapter) => adapter.finalizeRivers([false, 25, 2, 2]),
      (adapter) => adapter.validateAndFixTerrain(),
      (adapter) => adapter.generateCliffsFromElevation(),
      (adapter) => adapter.recalculateAreas(),
      (adapter) => adapter.storeWaterData(),
    ];
    const invalid: Array<{
      options: NonNullable<Parameters<typeof installWaterHeightMaintenanceProbe>[3]>;
      info: MapInfo;
    }> = [
      { options: WATER_HEIGHT_MAINTENANCE_PROBE, info: mapInfo(20) },
      ...[
        mapInfo(10),
        { ...mapInfo(20), LakeSizeCutoff: "20" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(20), MapSizeType: "MAPSIZE_STANDARD" },
        { ...mapInfo(20), GridWidth: 105 },
        { ...mapInfo(20), GridHeight: 65 },
      ].map((info) => ({ options: WATER_HEIGHT_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[
        mapInfo(10),
        mapInfo(20),
        { ...mapInfo(6996), LakeSizeCutoff: "6996" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(6996), MapSizeType: "MAPSIZE_STANDARD" },
      ].map((info) => ({ options: WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
      ...[
        mapInfo(10),
        mapInfo(20),
        mapInfo(6996),
        { ...mapInfo(40), LakeSizeCutoff: "40" },
        { MapSizeType: "MAPSIZE_HUGE" },
        null,
        mapInfo(Number.NaN),
        { ...mapInfo(40), MapSizeType: "MAPSIZE_STANDARD" },
      ].map((info) => ({ options: WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE, info: info as MapInfo })),
    ];
    for (const { options, info } of invalid) {
      for (const firstCall of firstCalls) {
        const { adapter, calls, metadataCalls, lines, decode } = fixture(info);
        installWaterHeightMaintenanceProbe(
          adapter,
          "invalid-activation",
          identity,
          options,
          (line) => lines.push(line)
        );
        expect(() => firstCall(adapter)).toThrow(
          `numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`
        );
        adapter.lookupMapInfo = () => mapInfo(options.expectedLakeSizeCutoff);
        expect(() => adapter.validateAndFixTerrain()).toThrow(
          `numeric LakeSizeCutoff=${options.expectedLakeSizeCutoff}`
        );
        expect(calls).toHaveLength(0);
        expect(metadataCalls).toHaveLength(2);
        expect(decode().map((record) => record.stage)).toEqual(["installed", "map-info"]);
        expect(decode()[1]!.payload).toMatchObject({
          activation: "refused",
          expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
        });
      }
    }
  });

  it("rejects missing identity and duplicate instrumentation without native calls", () => {
    const { adapter, lines, calls } = fixture();
    expect(() =>
      installWaterHeightMaintenanceProbe(adapter, "test", { ...identity, fixtureSourceSha256: "" })
    ).toThrow();
    installWaterHeightMaintenanceProbe(
      adapter,
      "test",
      identity,
      WATER_HEIGHT_MAINTENANCE_PROBE,
      (line) => lines.push(line)
    );
    expect(() => installWaterHeightMaintenanceProbe(adapter, "test", identity)).toThrow();
    expect(calls).toHaveLength(0);
  });

  it("builds a canonical whole-map observation fixture with its own source identity", async () => {
    const plan = await buildRiverProbePlan("maintenance-test", "authored", "full-map-maintenance");
    const proofContent = plan.files.find((file) => file.relativePath === "proof.json")!.content;
    if (typeof proofContent !== "string") throw new Error("Expected a text proof manifest.");
    const proof = JSON.parse(proofContent);
    expect(proof).toMatchObject({
      diagnosticRevision: 9,
      atlasKind: "full-map-maintenance",
      sourceConfigId: "swooper-earthlike",
      width: 106,
      height: 66,
      playerCount: 10,
      installDirectoryName: "mod-swooper-river-contract-v1",
      expectedLakeSizeCutoff: 10,
    });
    expect(proof.intervention).toBeUndefined();
    expect(proof.fixtureSourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(
      plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    ).toContain("[water-height-maintenance]");
    expect(plan.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(false);
    const modinfo = plan.files.find((file) => file.relativePath.endsWith(".modinfo"))!.content;
    expect(modinfo).not.toContain("MapInUse");
    expect(modinfo).not.toContain("diagnostic-map");
    expect(modinfo).not.toContain("lake-cutoff.xml");
    expect(
      plan.files.find((file) => file.relativePath === "maps/river-contract.js")!.content
    ).not.toContain("Lake cutoff diagnostic requires");
  });

  it.each([
    WATER_HEIGHT_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_MAX_LAKE_CUTOFF_PROBE,
    WATER_HEIGHT_BOUNDED_LAKE_CUTOFF_PROBE,
  ])("builds $atlasKind with qualified custom selection scoped to the exact diagnostic map", async (options) => {
    const control = await buildRiverProbePlan(
      "maintenance-control",
      "authored",
      "full-map-maintenance"
    );
    const plan = await buildRiverProbePlan("cutoff-treatment", "authored", options.atlasKind);
    const content = (files: typeof plan.files, path: string) => {
      const value = files.find((file) => file.relativePath === path)!.content;
      if (typeof value !== "string") throw new Error(`Expected text file: ${path}`);
      return value;
    };
    const proof = JSON.parse(content(plan.files, "proof.json"));
    const controlProof = JSON.parse(content(control.files, "proof.json"));
    expect(proof).toMatchObject({
      diagnosticRevision: options.diagnosticRevision,
      atlasKind: options.atlasKind,
      expectedLakeSizeCutoff: options.expectedLakeSizeCutoff,
      sourceConfigId: "swooper-earthlike",
      mapSeed: 1018,
      gameSeed: 1018,
      width: 106,
      height: 66,
      playerCount: 10,
      configHash: controlProof.configHash,
      envelopeHash: controlProof.envelopeHash,
      fixtureSourceSha256: controlProof.fixtureSourceSha256,
      settings: controlProof.settings,
      evidence: "built-only; no native observations",
      intervention: {
        kind: "source-qualified-classification-only",
        scope: "game",
        criterion: { MapInUse: riverProbeMapScript },
        table: "Maps",
        where: { MapSizeType: "MAPSIZE_HUGE" },
        set: { LakeSizeCutoff: options.expectedLakeSizeCutoff },
        setupSelection: `custom; captured Huge metadata differs only at numeric LakeSizeCutoff ${options.expectedLakeSizeCutoff}`,
      },
    });
    expect(proof.intervention.qualification).toContain(
      "no height, visual or navigation success claimed"
    );
    expect(proof.scriptSha256).not.toBe(controlProof.scriptSha256);
    expect(content(plan.files, "config/config.xml")).toBe(
      content(control.files, "config/config.xml")
    );
    expect(content(plan.files, "config/config.xml")).toContain(`File="${riverProbeMapScript}"`);
    expect(content(plan.files, "config/lake-cutoff.xml")).toBe(
      `<?xml version="1.0" encoding="utf-8"?>\n<Database><Maps><Update><Where MapSizeType="MAPSIZE_HUGE"/><Set LakeSizeCutoff="${options.expectedLakeSizeCutoff}"/></Update></Maps></Database>`
    );
    const modinfo = content(plan.files, "swooper-river-contract-v1.modinfo");
    expect(modinfo).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(modinfo).toContain(
      '<ActionGroup id="game-lake-cutoff" scope="game" criteria="diagnostic-map"><Actions><UpdateDatabase><Item>config/lake-cutoff.xml</Item></UpdateDatabase></Actions></ActionGroup>'
    );
    expect(modinfo.match(/<Item>config\/lake-cutoff\.xml<\/Item>/g)).toHaveLength(1);
    expect(content(plan.files, "maps/river-contract.js")).toContain("[water-height-maintenance]");
    expect(content(plan.files, "maps/river-contract.js")).toContain(
      "Lake cutoff diagnostic requires"
    );
    if (options.diagnosticRevision === 12) {
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain(
        "changed marine lake identity is a result"
      );
    } else if (options.diagnosticRevision === 15) {
      expect(proof.intervention.discriminator).toContain(
        "cutoff40 versus stock10 on Huge42, then unchanged on Huge1018"
      );
      expect(proof.intervention.discriminator).toContain("not a product cutoff");
      expect(proof.intervention.discriminator).toContain(
        "changed classifications are results, not activation refusals"
      );
      expect(
        content(plan.files, "maps/river-contract.js").includes(
          'projectLakeCutoffInitialSetup(capture, 40, "MAPSIZE_HUGE")'
        )
      ).toBe(true);
    } else {
      expect(proof.intervention.discriminator).toBeUndefined();
    }
  });

  it.each([
    42, 1018,
  ])("selects truthful seed %s metadata for paired stock10/cutoff40 without changing recipe or install identity", async (seed) => {
    const control = await buildRiverProbePlan(
      "bounded-control",
      "authored",
      "full-map-maintenance",
      { mapSeed: seed, gameSeed: seed }
    );
    const treatment = await buildRiverProbePlan(
      "bounded-treatment",
      "authored",
      "full-map-bounded-lake-cutoff",
      { mapSeed: seed, gameSeed: seed }
    );
    const content = (plan: typeof control, path: string) =>
      String(plan.files.find((file) => file.relativePath === path)!.content);
    const controlProof = JSON.parse(content(control, "proof.json"));
    const treatmentProof = JSON.parse(content(treatment, "proof.json"));
    for (const proof of [controlProof, treatmentProof])
      expect(proof).toMatchObject({
        mapSeed: seed,
        gameSeed: seed,
        sourceConfigId: "swooper-earthlike",
        width: 106,
        height: 66,
        playerCount: 10,
        mapScript: riverProbeMapScript,
        installDirectoryName: "mod-swooper-river-contract-v1",
      });
    expect(controlProof.expectedLakeSizeCutoff).toBe(10);
    expect(treatmentProof.expectedLakeSizeCutoff).toBe(40);
    for (const key of ["configHash", "envelopeHash", "fixtureSourceSha256", "settings"])
      expect(treatmentProof[key]).toEqual(controlProof[key]);
    expect(content(treatment, "config/lake-cutoff.xml")).toContain('<Set LakeSizeCutoff="40"/>');
    expect(content(treatment, "config/config.xml")).toBe(content(control, "config/config.xml"));
    expect(control.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(
      false
    );
    expect(content(control, "swooper-river-contract-v1.modinfo")).not.toContain("MapInUse");
    for (const plan of [control, treatment]) {
      const source = content(plan, "maps/river-contract.js");
      const registration = source.slice(
        source.lastIndexOf("installWaterHeightMaintenanceProbe(Civ7Adapter.prototype")
      );
      expect(new RegExp(`"mapSeed": ${seed}, "gameSeed": ${seed}`).test(registration)).toBe(true);
    }
  });

  it.each(
    ["swooper-earthlike", "sundered-archipelago"].flatMap((sourceConfigId) =>
      selectedSizes.map((mapSize) => ({ sourceConfigId, mapSize }))
    )
  )("resolves one canonical $sourceConfigId/$mapSize choice for stock and explicit-cutoff receipts", async ({
    sourceConfigId,
    mapSize,
  }) => {
    const preset = getCiv7StandardMapSizePreset(mapSize);
    const selection = {
      sourceConfigId,
      mapSize,
      mapSeed: -42,
      gameSeed: 7331,
      lakeSizeCutoff: "stock",
    } as const;
    const control = await buildRiverProbePlan(
      "selected-control",
      "authored",
      "full-map-bounded-lake-cutoff",
      selection
    );
    const treatment = await buildRiverProbePlan(
      "selected-treatment",
      "authored",
      "full-map-maintenance",
      { ...selection, playerCount: 2, lakeSizeCutoff: 100 }
    );
    const content = (plan: typeof control, path: string) =>
      String(plan.files.find((file) => file.relativePath === path)!.content);
    const controlProof = JSON.parse(content(control, "proof.json"));
    const treatmentProof = JSON.parse(content(treatment, "proof.json"));
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: [sourceConfigId] });
    for (const [proof, players, cutoff] of [
      [controlProof, preset.defaultPlayers, preset.mapInfo.LakeSizeCutoff],
      [treatmentProof, 2, 100],
    ] as const) {
      expect(proof).toMatchObject({
        sourceConfigId,
        mapSize,
        ...preset.dimensions,
        mapSeed: -42,
        gameSeed: 7331,
        playerCount: players,
        expectedLakeSizeCutoff: cutoff,
        configHash: canonicalMapConfigContentDigest(config!.canonicalConfig),
        envelopeHash: canonicalMapConfigDigest(config!.canonicalConfig),
        evidence: "built-only; no native observations",
      });
      expect(proof.liveVerifierFlags).toEqual([
        "--mutate",
        "--map-script",
        riverProbeMapScript,
        "--map-size",
        mapSize,
        "--seed",
        "-42",
        "--game-seed",
        "7331",
        "--player-count",
        String(players),
      ]);
    }
    for (const key of ["configHash", "envelopeHash", "fixtureSourceSha256", "settings"])
      expect(treatmentProof[key]).toEqual(controlProof[key]);
    expect(controlProof.intervention).toBeUndefined();
    expect(control.files.some((file) => file.relativePath === "config/lake-cutoff.xml")).toBe(
      false
    );
    expect(content(control, "swooper-river-contract-v1.modinfo")).not.toContain("MapInUse");
    expect(treatmentProof.intervention).toMatchObject({
      criterion: { MapInUse: riverProbeMapScript },
      where: { MapSizeType: mapSize },
      set: { LakeSizeCutoff: 100 },
      setupSelection: `custom; captured ${preset.label} metadata differs only at numeric LakeSizeCutoff 100`,
    });
    expect(content(treatment, "config/lake-cutoff.xml")).toBe(
      `<?xml version="1.0" encoding="utf-8"?>\n<Database><Maps><Update><Where MapSizeType="${mapSize}"/><Set LakeSizeCutoff="100"/></Update></Maps></Database>`
    );
    expect(content(treatment, "swooper-river-contract-v1.modinfo")).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(
      content(treatment, "swooper-river-contract-v1.modinfo").match(
        /<Item>config\/lake-cutoff\.xml<\/Item>/g
      )
    ).toHaveLength(1);
    expect(content(treatment, "config/config.xml")).toBe(content(control, "config/config.xml"));
    expect(
      content(treatment, "maps/river-contract.js").includes(
        `projectLakeCutoffInitialSetup(capture, 100, "${mapSize}")`
      )
    ).toBe(true);
  });

  it("uses each public preset's defaults and cell count rather than historical Huge constants", async () => {
    for (const mapSize of ["MAPSIZE_SMALL", "MAPSIZE_LARGE"] as const) {
      const preset = getCiv7StandardMapSizePreset(mapSize);
      const plan = await buildRiverProbePlan(
        "other-preset",
        "authored",
        "full-map-max-lake-cutoff",
        { mapSize }
      );
      const proof = JSON.parse(
        String(plan.files.find((file) => file.relativePath === "proof.json")!.content)
      );
      expect(proof).toMatchObject({
        mapSize,
        ...preset.dimensions,
        playerCount: preset.defaultPlayers,
        expectedLakeSizeCutoff: preset.dimensions.width * preset.dimensions.height,
      });
    }
  });

  it("refuses unknown selectors, inadmissible players, cutoffs and either invalid seed before bundling", async () => {
    const invalid: WaterHeightDiagnosticSelection[] = [
      { sourceConfigId: "not-a-shipped-profile" },
      { mapSize: "MAPSIZE_CUSTOM" },
      ...[0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2281].map((lakeSizeCutoff) => ({
        mapSize: "MAPSIZE_TINY",
        lakeSizeCutoff,
      })),
      ...[0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 5].map((playerCount) => ({
        mapSize: "MAPSIZE_TINY",
        playerCount,
      })),
      ...[Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0x8000_0000, -0x8000_0001].flatMap((seed) => [
        { mapSeed: seed },
        { gameSeed: seed },
      ]),
    ];
    for (const selection of invalid)
      await expect(
        buildRiverProbePlan("bad-selection", "authored", "full-map-maintenance", selection)
      ).rejects.toThrow();
  });

  it("rejects invalid or unrelated explicit seed metadata before bundling", async () => {
    for (const seed of [Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0x8000_0000, -0x8000_0001])
      await expect(
        buildRiverProbePlan("bad-seed", "authored", "full-map-bounded-lake-cutoff", {
          mapSeed: seed,
          gameSeed: seed,
        })
      ).rejects.toThrow("signed 32-bit seed");
    for (const atlas of [
      "synthetic-river-v4",
      "terrain-admission",
      "full-map-observe",
      "water-connectivity-cutoff-10",
    ] as const)
      await expect(
        buildRiverProbePlan("unrelated-seed", "authored", atlas, { mapSeed: 42, gameSeed: 42 })
      ).rejects.toThrow("only for maintenance atlases");
    await expect(
      buildRiverProbePlan("unsupported", "aesthetic", "full-map-bounded-lake-cutoff")
    ).rejects.toThrow("authored finalization tuple");
  });
});
