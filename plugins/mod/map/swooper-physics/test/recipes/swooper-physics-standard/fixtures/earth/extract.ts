import { Database } from "bun:sqlite";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const provenance = {
  resourcesCommit: "89cee44d5ae7192f126e8ae09484c04400df9146",
  sourceDirectory: "Base/modules/base-standard/maps/EarthMaps",
  database: {
    name: "Earth_Huge.Civ7Map",
    sha256: "46841392de74b18a034e311fb13c5f7bbbd5e03f2b54a26030d586431a4f332d",
  },
  script: {
    name: "Earth_Huge.js",
    sha256: "47b2e527757dd3984ec02c718bc5bc111d8be41b321ea703b67030a05b286054",
  },
} as const;

function pinnedBytes(
  directory: string,
  source: typeof provenance.database | typeof provenance.script
) {
  const bytes = readFileSync(resolve(directory, source.name));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.name);
  return bytes;
}

function integer(node: ts.Node | undefined): number {
  assert(node && ts.isNumericLiteral(node), "Only literal integer source data is admitted.");
  const value = Number(node.text);
  assert(Number.isSafeInteger(value) && value >= 0);
  return value;
}

function member(node: ts.Node | undefined, owner: string): string {
  assert(node && ts.isPropertyAccessExpression(node));
  assert(ts.isIdentifier(node.expression) && node.expression.text === owner);
  return node.name.text;
}

/** Reads data literals only: never imports or executes the engine-bound Earth script. */
export function extractEarthScript(source: string) {
  const file = ts.createSourceFile(
    "Earth_Huge.js",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );
  const functions = file.statements.filter(ts.isFunctionDeclaration);
  const named = (name: string) => {
    const matches = functions.filter((node) => node.name?.text === name);
    assert.equal(matches.length, 1, `Expected one ${name}.`);
    assert(matches[0]!.body);
    return matches[0]!.body;
  };
  const declarations = named("paintEarthHugeElevation")
    .statements.filter(ts.isVariableStatement)
    .flatMap((node) => [...node.declarationList.declarations])
    .filter((node) => ts.isIdentifier(node.name) && node.name.text === "elevationArray");
  assert.equal(declarations.length, 1);
  const initializer = declarations[0]!.initializer;
  assert(initializer && ts.isArrayLiteralExpression(initializer));
  const elevation = initializer.elements.map(integer);
  const rivers: Array<readonly [number, number, string, string]> = [];
  for (const statement of named("paintEarthHugeRivers").statements) {
    assert(ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression));
    const call = statement.expression;
    const method = member(call.expression, "TerrainBuilder");
    if (method === "validateAndFixTerrain") continue;
    assert.equal(method, "setRiverInfo", "Unexpected river-painter operation.");
    assert.equal(call.arguments.length, 4);
    rivers.push([
      integer(call.arguments[0]),
      integer(call.arguments[1]),
      member(call.arguments[2], "DirectionTypes"),
      member(call.arguments[3], "RiverTypes"),
    ]);
  }
  return { elevation, rivers };
}

/** Re-extracts the small, versioned test dataset from hash-pinned read-only official sources. */
export function extractEarthReference(directory: string) {
  pinnedBytes(directory, provenance.database);
  const script = extractEarthScript(pinnedBytes(directory, provenance.script).toString("utf8"));
  const db = new Database(resolve(directory, provenance.database.name), { readonly: true });
  try {
    const maps = db
      .query<
        {
          Width: number;
          Height: number;
          TopLatitude: number;
          BottomLatitude: number;
          WrapX: number;
          WrapY: number;
          MapSizeType: string;
        },
        []
      >("SELECT Width, Height, TopLatitude, BottomLatitude, WrapX, WrapY, MapSizeType FROM Map")
      .all();
    assert.equal(maps.length, 1);
    const map = maps[0]!;
    assert.deepEqual(map, {
      Width: 106,
      Height: 66,
      TopLatitude: 90,
      BottomLatitude: -90,
      WrapX: 1,
      WrapY: 0,
      MapSizeType: "MAPSIZE_HUGE",
    });
    const plots = db
      .query<{ ID: number; TerrainType: string; Elevation: number }, []>(
        "SELECT ID, TerrainType, Elevation FROM Plots ORDER BY ID"
      )
      .all();
    assert.equal(plots.length, map.Width * map.Height);
    assert.equal(script.elevation.length, plots.length);
    const terrainCodes: Record<string, string> = {
      TERRAIN_OCEAN: "O",
      TERRAIN_COAST: "C",
      TERRAIN_FLAT: "F",
      TERRAIN_HILL: "H",
      TERRAIN_MOUNTAIN: "M",
    };
    const terrain = plots.map((plot, index) => {
      assert.equal(plot.ID, index, "Plot IDs must form the full row-major array.");
      assert.equal(plot.Elevation, 0, "DB elevation is not the painted relief source.");
      const code = terrainCodes[plot.TerrainType];
      assert(code, `Unknown source terrain ${plot.TerrainType}.`);
      assert(script.elevation[index]! <= 32767, "Native elevation must fit losslessly in Int16.");
      return code;
    });
    for (const [x, y, direction, kind] of script.rivers) {
      assert(x < map.Width && y < map.Height);
      assert(
        [
          "DIRECTION_WEST",
          "DIRECTION_EAST",
          "DIRECTION_NORTHWEST",
          "DIRECTION_NORTHEAST",
          "DIRECTION_SOUTHWEST",
          "DIRECTION_SOUTHEAST",
        ].includes(direction)
      );
      assert(["RIVER_MINOR", "RIVER_NAVIGABLE"].includes(kind));
    }
    return {
      format: "firaxis-earth-huge-reference-v1",
      provenance,
      grid: {
        width: map.Width,
        height: map.Height,
        topLatitude: map.TopLatitude,
        bottomLatitude: map.BottomLatitude,
        wrapX: true,
        wrapY: false,
        rowZero: "south",
        indexing: "y * width + x",
        adjacency: "odd-row-offset",
      },
      databaseElevation: "all-zero-not-relief",
      elevationUnits: "unchanged-native-index-not-metres",
      terrainLegend: terrainCodes,
      nativeElevationRows: Array.from({ length: map.Height }, (_, y) =>
        script.elevation.slice(y * map.Width, (y + 1) * map.Width)
      ),
      terrainRows: Array.from({ length: map.Height }, (_, y) =>
        terrain.slice(y * map.Width, (y + 1) * map.Width).join("")
      ),
      riverDeclarations: script.rivers,
    };
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  const directory =
    process.argv[2] ??
    resolve(
      import.meta.dir,
      "../../../../../../../../../.civ7/outputs/resources",
      provenance.sourceDirectory
    );
  const extracted = extractEarthReference(directory);
  const output = resolve(import.meta.dir, "earth-huge.json");
  if (process.argv.includes("--write")) {
    // Generated data stays compact (one array per source row), without opaque binary encoding.
    writeFileSync(output, `${JSON.stringify(extracted)}\n`);
  } else {
    assert.deepEqual(JSON.parse(readFileSync(output, "utf8")), extracted);
  }
  console.log(
    `Earth reference ${process.argv.includes("--write") ? "written" : "matches pinned sources"}: ${extracted.nativeElevationRows.flat().length} cells, ${extracted.riverDeclarations.length} river declarations.`
  );
}
