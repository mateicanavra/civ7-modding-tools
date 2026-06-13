import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { inspectCiv7LocalData } from "../../src/utils/civ7LocalData";

describe("inspectCiv7LocalData", () => {
  test("labels local disk surfaces as enrichment rather than live authority", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "civ7-local-data-"));
    try {
      fs.mkdirSync(path.join(root, "Debug"), { recursive: true });
      fs.mkdirSync(path.join(root, "Saves", "SinglePlayer"), { recursive: true });
      fs.mkdirSync(path.join(root, "Logs"), { recursive: true });
      createSqliteOrPlaceholder(path.join(root, "Debug", "gameplay-copy.sqlite"));
      fs.writeFileSync(path.join(root, "Saves", "SinglePlayer", "AutoSave.Civ7Save"), "CIV7");
      fs.writeFileSync(path.join(root, "Logs", "UnitOperations.log"), "operation log");

      const inventory = inspectCiv7LocalData({ appSupportDir: root, includeTableCounts: true });

      expect(inventory.exists).toBe(true);
      expect(inventory.authority.directControl).toContain("live authority");
      expect(inventory.authority.warning).toContain("does not prove current turn legality");
      expect(inventory.databases.map((database) => database.relativePath)).toContain(
        "Debug/gameplay-copy.sqlite"
      );
      expect(inventory.saves.map((save) => save.relativePath)).toContain(
        "Saves/SinglePlayer/AutoSave.Civ7Save"
      );
      expect(inventory.logs.map((log) => log.relativePath)).toContain("Logs/UnitOperations.log");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("returns a missing inventory for absent app-support directories", () => {
    const inventory = inspectCiv7LocalData({
      appSupportDir: path.join(os.tmpdir(), "missing-civ7-local-data-dir"),
    });

    expect(inventory.exists).toBe(false);
    expect(inventory.databases).toEqual([]);
    expect(inventory.saves).toEqual([]);
    expect(inventory.logs).toEqual([]);
  });
});

function createSqliteOrPlaceholder(file: string): void {
  const sqlite3 = spawnSync("which", ["sqlite3"], { encoding: "utf8" }).stdout.trim();
  if (sqlite3) {
    spawnSync(sqlite3, [file, "create table Things(id integer primary key);"], {
      encoding: "utf8",
    });
    return;
  }
  fs.writeFileSync(file, "");
}
