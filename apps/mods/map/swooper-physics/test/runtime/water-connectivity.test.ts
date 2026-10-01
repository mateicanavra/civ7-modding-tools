import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { expectCiv7MapScriptCompatibility } from "./civ7-map-script-compatibility.fixture.js";
import { RIVER_PROBE } from "./river-contract-map.fixture.js";
import { buildRiverProbePlan, riverProbeMapScript } from "./river-contract-probe.fixture.js";
import {
  buildWaterConnectivityElevation,
  buildWaterConnectivityFixture,
  buildWaterConnectivityWrites,
  buildWaterLowerBoundElevation,
  buildWaterLowerBoundFixture,
  WATER_CONNECTIVITY_ATLASES,
  WATER_CONNECTIVITY_CONTROLS,
  WATER_CONNECTIVITY_ISOLATED,
  WATER_LOWER_BOUND_ATLAS,
  WATER_LOWER_BOUND_CONTROLS,
  WATER_LOWER_BOUND_PROBE,
  waterConnectivityProbe,
  waterConnectivityTerrainAt,
  waterLowerBoundTerrainAt,
} from "./water-connectivity.fixture.js";

const cell = ({ x, y }: { x: number; y: number }) => x + y * RIVER_PROBE.width;
function sourceWaterComponents(terrainAt = waterConnectivityTerrainAt) {
  const { width, height } = RIVER_PROBE;
  const componentByCell = new Int32Array(width * height).fill(-1);
  const components: number[][] = [];
  for (let index = 0; index < componentByCell.length; index++) {
    if (
      componentByCell[index] !== -1 ||
      terrainAt(index % width, Math.floor(index / width)) === "FLAT"
    )
      continue;
    const queue = [index];
    componentByCell[index] = components.length;
    for (let head = 0; head < queue.length; head++) {
      const at = queue[head]!;
      for (const neighbor of getHexNeighborIndicesOddQ(
        at % width,
        Math.floor(at / width),
        width,
        height
      )) {
        if (
          componentByCell[neighbor] !== -1 ||
          terrainAt(neighbor % width, Math.floor(neighbor / width)) === "FLAT"
        )
          continue;
        componentByCell[neighbor] = components.length;
        queue.push(neighbor);
      }
    }
    components.push(queue);
  }
  return { componentByCell, components };
}

describe("water connectivity atlas source geometry (not native classification)", () => {
  it("isolates every 5/6-cell pair and exact cutoff neighbors except the declared ordinary-water straits", () => {
    const { componentByCell, components } = sourceWaterComponents();
    const ocean = componentByCell[0]!;
    expect(components[ocean]!.length).toBeGreaterThan(10);
    expect(WATER_CONNECTIVITY_CONTROLS).toHaveLength(8);
    expect(WATER_CONNECTIVITY_ISOLATED.map(({ size }) => size)).toEqual([4, 5, 6, 9, 10, 11]);
    const allControlCells = [
      ...WATER_CONNECTIVITY_CONTROLS,
      ...WATER_CONNECTIVITY_ISOLATED,
    ].flatMap(({ cells }) => cells.map(cell));
    expect(new Set(allControlCells).size).toBe(allControlCells.length);
    for (const control of WATER_CONNECTIVITY_CONTROLS) {
      expect(control.cells).toHaveLength(control.size);
      const id = componentByCell[cell(control.cells[0]!)]!;
      expect(control.cells.every((point) => componentByCell[cell(point)] === id)).toBe(true);
      if (control.connection === "coast-strait") {
        expect(id).toBe(ocean);
        expect(control.connector.every((point) => componentByCell[cell(point)] === ocean)).toBe(
          true
        );
      } else {
        expect(id).not.toBe(ocean);
        expect(components[id]).toHaveLength(control.size);
        expect(
          control.connector.every(
            (point) => waterConnectivityTerrainAt(point.x, point.y) === "FLAT"
          )
        ).toBe(true);
      }
    }
    for (const control of WATER_CONNECTIVITY_ISOLATED) {
      const id = componentByCell[cell(control.cells[0]!)]!;
      expect(id).not.toBe(ocean);
      expect(components[id]).toHaveLength(control.size);
    }
    expect(components).toHaveLength(13);
    for (const x of [4, 18, 34, 50]) expect(waterConnectivityTerrainAt(x, 34)).toBe("FLAT");
  });

  it("holds translated local height profiles and changes only strait terrain or declared river classes", () => {
    const heights = buildWaterConnectivityElevation();
    expect(heights).toHaveLength(60 * 38);
    for (const size of [5, 6]) {
      const controls = WATER_CONNECTIVITY_CONTROLS.filter((control) => control.size === size);
      const reference = controls[0]!;
      for (const control of controls) {
        expect(control.wetOutlet.y % 2).toBe(reference.wetOutlet.y % 2);
        for (let dy = -1; dy <= 2; dy++) {
          for (let x = 3; x <= 14; x++) {
            expect(heights[x + (control.wetOutlet.y + dy) * 60]).toBe(
              heights[x + (reference.wetOutlet.y + dy) * 60]
            );
            const onConnector = dy === 0 && x <= 9;
            if (!onConnector)
              expect(waterConnectivityTerrainAt(x, control.wetOutlet.y + dy)).toBe(
                waterConnectivityTerrainAt(x, reference.wetOutlet.y + dy)
              );
          }
        }
      }
    }
    const writes = buildWaterConnectivityWrites();
    expect(writes).toHaveLength(30);
    expect(new Set(writes.map(cell)).size).toBe(writes.length);
    const wetWrites = writes.filter(
      (write) => waterConnectivityTerrainAt(write.x, write.y) === "COAST"
    );
    expect(wetWrites).toHaveLength(2);
    expect(
      wetWrites.every(
        (write) => write.riverClass === "NAVIGABLE" && write.role === "qualified-wet-nav-outlet"
      )
    ).toBe(true);
    for (const write of writes) {
      expect(write.expectedReceiver).toEqual({ x: write.x - 1, y: write.y });
      expect(heights[cell(write)]!).toBeGreaterThan(heights[cell(write.expectedReceiver)]!);
    }
    const first = buildWaterConnectivityFixture(WATER_CONNECTIVITY_ATLASES[0], "a".repeat(64));
    const second = buildWaterConnectivityFixture(WATER_CONNECTIVITY_ATLASES[1], "a".repeat(64));
    expect(first.heights).toEqual(second.heights);
    expect(first.writes).toEqual(second.writes);
    expect(first.controls).toEqual(second.controls);
    expect(first.isolated).toEqual(second.isolated);
  });
});

describe("closed water lower-bound source requests (not native elevation acceptance)", () => {
  it("holds stock Tiny and four translated isolated bodies with complete disjoint dry shores", () => {
    const tiny = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
    expect(WATER_LOWER_BOUND_PROBE).toMatchObject({
      diagnosticRevision: 15,
      atlasKind: WATER_LOWER_BOUND_ATLAS,
      mapSize: tiny.id,
      width: tiny.dimensions.width,
      height: tiny.dimensions.height,
      playerCount: tiny.defaultPlayers,
      expectedLakeSizeCutoff: tiny.mapInfo.LakeSizeCutoff,
    });
    expect([
      tiny.dimensions.width,
      tiny.dimensions.height,
      tiny.defaultPlayers,
      tiny.mapInfo.LakeSizeCutoff,
    ]).toEqual([60, 38, 4, 6]);
    expect(WATER_CONNECTIVITY_ATLASES).toEqual([
      "water-connectivity-cutoff-5",
      "water-connectivity-cutoff-10",
    ]);
    const { componentByCell, components } = sourceWaterComponents(waterLowerBoundTerrainAt);
    const ocean = componentByCell[0]!;
    expect(components).toHaveLength(5);
    expect(WATER_LOWER_BOUND_CONTROLS).toHaveLength(4);
    const requestedCells: number[] = [];
    for (const control of WATER_LOWER_BOUND_CONTROLS) {
      expect(control.cells).toHaveLength(4);
      const id = componentByCell[cell(control.cells[0]!)]!;
      expect(id).not.toBe(ocean);
      expect(components[id]).toHaveLength(4);
      expect(control.cells.every((point) => componentByCell[cell(point)] === id)).toBe(true);
      const body = new Set(control.cells.map(cell));
      const neighbors = new Set(
        control.cells
          .flatMap(({ x, y }) =>
            getHexNeighborIndicesOddQ(x, y, tiny.dimensions.width, tiny.dimensions.height)
          )
          .filter((neighbor) => !body.has(neighbor))
      );
      expect(control.shore.map(cell).sort((a, b) => a - b)).toEqual(
        [...neighbors].sort((a, b) => a - b)
      );
      expect(control.shore).toHaveLength(10);
      expect(control.shore.every(({ x, y }) => waterLowerBoundTerrainAt(x, y) === "FLAT")).toBe(
        true
      );
      requestedCells.push(...control.cells.map(cell), ...control.shore.map(cell));
      const origin = control.cells[0]!;
      expect(origin.y % 2).toBe(0);
      expect(control.cells.map(({ x, y }) => [x - origin.x, y - origin.y])).toEqual([
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]);
      expect(
        [...control.cells, ...control.shore].every(
          ({ x, y }) => x >= 0 && x < tiny.dimensions.width && y >= 0 && y < tiny.dimensions.height
        )
      ).toBe(true);
    }
    expect(new Set(requestedCells).size).toBe(requestedCells.length);
    for (const x of [4, 18, 34, 50]) expect(waterLowerBoundTerrainAt(x, 34)).toBe("FLAT");
  });

  it("requests only the four declared native wet/shore pairs and holds every exterior value", () => {
    const heights = buildWaterLowerBoundElevation();
    expect(heights).toHaveLength(2280);
    expect(
      WATER_LOWER_BOUND_CONTROLS.map((control) => [
        control.wetElevationInput,
        control.shoreElevationInput,
      ])
    ).toEqual([
      [0, 129],
      [0, 128],
      [0, 127],
      [-1, 128],
    ]);
    const changed = new Set<number>();
    for (const control of WATER_LOWER_BOUND_CONTROLS) {
      for (const point of control.cells) {
        changed.add(cell(point));
        expect(waterLowerBoundTerrainAt(point.x, point.y)).toBe("COAST");
        expect(heights[cell(point)]).toBe(control.wetElevationInput);
      }
      for (const point of control.shore) {
        changed.add(cell(point));
        expect(heights[cell(point)]).toBe(control.shoreElevationInput);
      }
    }
    for (let at = 0; at < heights.length; at++) {
      if (changed.has(at)) continue;
      const x = at % 60,
        y = Math.floor(at / 60);
      expect(heights[at]).toBe(x <= 2 || x >= 57 || y <= 1 || y >= 36 ? 0 : 700);
    }
    const fixture = buildWaterLowerBoundFixture("a".repeat(64));
    expect(fixture.writes).toEqual([]);
    expect(fixture.controls).toEqual([]);
    expect(fixture.isolated).toEqual(WATER_LOWER_BOUND_CONTROLS);
    expect(fixture.qualification).toContain("wet setter may ignore");
    expect(() => buildWaterLowerBoundFixture("invalid")).toThrow("source identity");
  });

  it("builds one independently identified stock-metadata arm without a database treatment", async () => {
    const plan = await buildRiverProbePlan("lower-bound-test", "authored", WATER_LOWER_BOUND_ATLAS);
    const text = (name: string) =>
      String(plan.files.find(({ relativePath }) => relativePath === name)!.content);
    const script = text("maps/river-contract.js");
    await expectCiv7MapScriptCompatibility(script, "water-closed-lower-bound.js");
    expect(plan.files.some(({ relativePath }) => relativePath === "config/lake-cutoff.xml")).toBe(
      false
    );
    expect(text(`${RIVER_PROBE.id}.modinfo`)).not.toContain("game-lake-cutoff");
    const proof = JSON.parse(text("proof.json"));
    expect(proof).toMatchObject({
      ...WATER_LOWER_BOUND_PROBE,
      proofId: "lower-bound-test",
      variant: "authored",
      settings: [false, 25, 2, 2],
      scriptSha256: createHash("sha256").update(script).digest("hex"),
      intervention: {
        kind: "closed-water-native-lower-bound",
        expectedLakeSizeCutoff: 6,
        databaseTreatment: "none; public Tiny stock row held",
        elevationUnits: "native numeric setter requests",
        immediateCheckpoint: "after-elevation-write",
      },
      liveVerifierFlags: [
        "--mutate",
        "--map-script",
        riverProbeMapScript,
        "--map-size",
        "MAPSIZE_TINY",
        "--seed",
        "1018",
        "--game-seed",
        "1019",
        "--player-count",
        "4",
      ],
    });
    expect(proof.fixtureSourceSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(script).toContain(proof.fixtureSourceSha256);
    expect(proof.evidence).toContain("no native observations");
    await expect(
      buildRiverProbePlan("lower-bound-test", "aesthetic", WATER_LOWER_BOUND_ATLAS)
    ).rejects.toThrow("authored finalization tuple");
    await expect(
      buildRiverProbePlan("lower-bound-test", "authored", WATER_LOWER_BOUND_ATLAS, {
        lakeSizeCutoff: 5,
      })
    ).rejects.toThrow("only for maintenance atlases");
  });
});

describe("water connectivity build routing (no deployment or native success)", () => {
  it.each([
    ...WATER_CONNECTIVITY_ATLASES,
  ])("builds %s as a scoped Tiny classification treatment", async (atlas) => {
    const options = waterConnectivityProbe(atlas);
    const plan = await buildRiverProbePlan("water-artifact-test", "authored", atlas);
    const text = (name: string) =>
      String(plan.files.find(({ relativePath }) => relativePath === name)!.content);
    const script = text("maps/river-contract.js");
    await expectCiv7MapScriptCompatibility(script, `${atlas}.js`);
    expect(text("config/lake-cutoff.xml")).toContain(
      `<Where MapSizeType="MAPSIZE_TINY"/><Set LakeSizeCutoff="${options.expectedLakeSizeCutoff}"/>`
    );
    expect(text("config/lake-cutoff.xml")).not.toContain("MAPSIZE_HUGE");
    const modinfo = text(`${RIVER_PROBE.id}.modinfo`);
    expect(modinfo).toContain(
      `<Criteria id="diagnostic-map"><MapInUse>${riverProbeMapScript}</MapInUse></Criteria>`
    );
    expect(modinfo).toContain(
      '<ActionGroup id="game-lake-cutoff" scope="game" criteria="diagnostic-map">'
    );
    expect(modinfo).not.toContain('<Mod id="swooper-maps"');
    const proof = JSON.parse(text("proof.json"));
    expect(proof).toMatchObject({
      ...options,
      proofId: "water-artifact-test",
      variant: "authored",
      atlasKind: atlas,
      settings: [false, 25, 2, 2],
      scriptSha256: createHash("sha256").update(script).digest("hex"),
      intervention: {
        where: { MapSizeType: "MAPSIZE_TINY" },
        set: { LakeSizeCutoff: options.expectedLakeSizeCutoff },
        criterion: { MapInUse: riverProbeMapScript },
      },
    });
    expect(proof.fixtureSourceSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(proof.evidence).toContain("no native observations");
    expect(script).toContain(proof.fixtureSourceSha256);
    expect(script).not.toMatch(/GameInfo\s*\.\s*Maps[^;\n]*LakeSizeCutoff\s*=/);
    await expect(buildRiverProbePlan("water-artifact-test", "aesthetic", atlas)).rejects.toThrow(
      "authored finalization tuple"
    );
  });

  it("keeps revisions distinct and refuses unknown selectors or invalid source identity", () => {
    expect(
      WATER_CONNECTIVITY_ATLASES.map((atlas) => waterConnectivityProbe(atlas).diagnosticRevision)
    ).toEqual([13, 14]);
    expect(() =>
      waterConnectivityProbe("invalid" as (typeof WATER_CONNECTIVITY_ATLASES)[number])
    ).toThrow();
    expect(() => buildWaterConnectivityFixture(WATER_CONNECTIVITY_ATLASES[0], "invalid")).toThrow(
      "source identity"
    );
  });
});
