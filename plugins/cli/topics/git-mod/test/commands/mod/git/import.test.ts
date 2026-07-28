import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@civ7/plugin-git", () => ({
  configureRemote: vi.fn(),
  importSubtree: vi.fn(),
}));

import ModGitImport from "../../../../src/commands/mod/git/import";
import { configureRemote, importSubtree } from "@civ7/plugin-git";

describe("mod git import command", () => {
  beforeEach(() => vi.clearAllMocks());

  test("configures remote then imports subtree", async () => {
    await ModGitImport.run(["my-mod", "--repoUrl", "https://example.com/repo.git"]);
    expect(configureRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "my-mod",
        repoUrl: "https://example.com/repo.git",
      })
    );
    expect(importSubtree).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: "mods/my-mod",
        slug: "my-mod",
      })
    );
  });

  test("requires the repository URL at the command boundary", async () => {
    await expect(ModGitImport.run(["my-mod"])).rejects.toThrow(/repoUrl/);
    expect(configureRemote).not.toHaveBeenCalled();
    expect(importSubtree).not.toHaveBeenCalled();
  });
});
