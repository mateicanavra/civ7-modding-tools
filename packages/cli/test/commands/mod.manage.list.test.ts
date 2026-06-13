import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@civ7/plugin-mods", () => ({
  listMods: vi.fn(() => ["A", "B"]),
  resolveModsDir: vi.fn(() => ({ modsDir: "/Mods", platform: "darwin" })),
}));

import { listMods } from "@civ7/plugin-mods";
import ModManageList from "../../src/commands/mod/manage/list";

describe("mod manage list command", () => {
  beforeEach(() => vi.clearAllMocks());

  test("lists mods from default dir", async () => {
    await ModManageList.run([]);
    expect(listMods).toHaveBeenCalledWith("/Mods");
  });
});
