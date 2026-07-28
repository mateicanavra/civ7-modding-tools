import { describe, expect, test } from "bun:test";
import { parseDiffLayersArgs } from "../../scripts/diagnostics/diff-layers";
import { parseExtractTraceArgs } from "../../scripts/diagnostics/extract-trace";
import { parseListLayersArgs } from "../../scripts/diagnostics/list-layers";
import { parseStandardDumpArgs } from "../../scripts/diagnostics/run-standard-dump";

const REQUIRED_DUMP_ARGS = ["--map-seed", "1337", "--game-seed=-1337", "--players", "0,1"] as const;

describe("diagnostic command inputs", () => {
  test("admits only each command's declared operands and filters", () => {
    expect(
      parseDiffLayersArgs([
        "run-a",
        "run-b",
        "--prefix",
        "morphology.",
        "--data-type-key",
        "morphology.topography.landMask",
      ])
    ).toEqual({
      runDirA: "run-a",
      runDirB: "run-b",
      prefix: "morphology.",
      dataTypeKey: "morphology.topography.landMask",
    });
    expect(parseListLayersArgs(["run-a", "--prefix", "foundation."])).toEqual({
      runDir: "run-a",
      prefix: "foundation.",
      dataTypeKey: undefined,
    });
    expect(parseExtractTraceArgs(["run-a", "--event-prefix", "hydrology."])).toEqual({
      runDir: "run-a",
      eventKind: undefined,
      eventPrefix: "hydrology.",
    });
  });

  test("rejects missing operands, surplus operands, and undeclared options", () => {
    expect(() => parseDiffLayersArgs(["run-a"])).toThrow("Usage:");
    expect(() => parseListLayersArgs(["run-a", "run-b"])).toThrow("Usage:");
    expect(() => parseExtractTraceArgs(["run-a", "--unknown", "value"])).toThrow();
  });

  test("admits signed Civ7 seeds through Node's unambiguous inline option form", () => {
    const input = parseStandardDumpArgs([
      ...REQUIRED_DUMP_ARGS,
      "--map-size",
      "MAPSIZE_TINY",
      "--label",
      "signed-seeds",
    ]);

    expect(input).toMatchObject({
      mapSeed: 1337,
      gameSeed: -1337,
      label: "signed-seeds",
      preset: { id: "MAPSIZE_TINY" },
      aliveMajorPlayerIds: [0, 1],
    });
    expect(() =>
      parseStandardDumpArgs(["--map-seed=2147483648", "--game-seed", "1", "--players", "0"])
    ).toThrow("--map-seed must be an integer from -2147483648 to 2147483647");
    expect(() =>
      parseStandardDumpArgs(["--map-seed", "1337", "--game-seed", "-1337", "--players", "0"])
    ).toThrow();
  });

  test("requires complete named dump inputs and rejects unknown options", () => {
    expect(() => parseStandardDumpArgs(["--game-seed", "1", "--players", "0"])).toThrow(
      "--map-seed requires an integer value"
    );
    expect(() => parseStandardDumpArgs([...REQUIRED_DUMP_ARGS, "--unknown", "value"])).toThrow();
    expect(() => parseStandardDumpArgs([...REQUIRED_DUMP_ARGS, "positional"])).toThrow();
  });

  test("admits object overrides and rejects non-object JSON", () => {
    expect(
      parseStandardDumpArgs([
        ...REQUIRED_DUMP_ARGS,
        "--override",
        '{"foundation-lithosphere":{"plate-graph":{"computePlateGraph":{"config":{"plateCount":6}}}}}',
      ]).override
    ).toEqual({
      "foundation-lithosphere": {
        "plate-graph": { computePlateGraph: { config: { plateCount: 6 } } },
      },
    });
    expect(() =>
      parseStandardDumpArgs([...REQUIRED_DUMP_ARGS, "--override", '["not-an-object"]'])
    ).toThrow("--override must contain a JSON object");
  });
});
