import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { loadCiv7SetupCatalog } from "../../src/server/civ7Resources/catalog";

describe("Civ7 setup catalog", () => {
  it("extracts setup options from official resource XML rows", async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), "studio-civ7-catalog-"));
    const resourceDir = join(repoRoot, ".civ7", "outputs", "resources", "Base", "modules", "base-standard", "data");
    await mkdir(resourceDir, { recursive: true });
    await writeFile(
      join(resourceDir, "leaders.xml"),
      `<Database><Leaders>
        <Row LeaderType="LEADER_ALEXANDER" Name="LOC_LEADER_ALEXANDER_NAME" IsMajorLeader="true"/>
        <Row LeaderType="LEADER_MINOR_CIV_DEFAULT" Name="LOC_MINOR"/>
      </Leaders></Database>`,
    );
    await writeFile(
      join(resourceDir, "civilizations.xml"),
      `<Database><Civilizations>
        <Row CivilizationType="CIVILIZATION_GREECE" Name="LOC_CIVILIZATION_GREECE_NAME" StartingCivilizationLevelType="CIVILIZATION_LEVEL_FULL_CIV"/>
        <Row CivilizationType="CIVILIZATION_INDEPENDENT" Name="LOC_CIVILIZATION_INDEPENDENT_NAME" StartingCivilizationLevelType="CIVILIZATION_LEVEL_INDEPENDENT"/>
      </Civilizations></Database>`,
    );
    await writeFile(
      join(resourceDir, "difficulties.xml"),
      `<Database><Difficulties><Row DifficultyType="DIFFICULTY_CUSTOM" Name="LOC_DIFFICULTY_CUSTOM_NAME"/></Difficulties></Database>`,
    );
    await writeFile(
      join(resourceDir, "game-speeds.xml"),
      `<Database><GameSpeeds><Row><GameSpeedType>GAMESPEED_STANDARD</GameSpeedType><Name>LOC_GAMESPEED_STANDARD_NAME</Name></Row></GameSpeeds></Database>`,
    );

    const catalog = await loadCiv7SetupCatalog({
      repoRoot,
      appResourcesRoot: join(repoRoot, "missing-app-resources"),
    });

    expect(catalog.leaders.map((option) => option.value)).toEqual(["LEADER_ALEXANDER"]);
    expect(catalog.civilizations.map((option) => option.value)).toEqual(["CIVILIZATION_GREECE"]);
    expect(catalog.difficulties.map((option) => option.value)).toEqual(["DIFFICULTY_CUSTOM"]);
    expect(catalog.gameSpeeds.map((option) => option.value)).toEqual(["GAMESPEED_STANDARD"]);
  });
});
