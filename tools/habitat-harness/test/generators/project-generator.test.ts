import { projectGenerator } from "@internal/habitat-harness/service/modules/scaffold/project/generator";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { describe, expect, test } from "vitest";

describe("Habitat project generator", () => {
  test("creates a supported plugin project at its canonical root", async () => {
    const tree = createProjectTree();

    await projectGenerator(tree, { name: "rules", kind: "plugin" });

    expect(tree.exists("packages/plugins/plugin-rules/src/index.ts")).toBe(true);
    expect(tree.exists("packages/plugins/plugin-rules/test/index.test.ts")).toBe(true);
    const packageJson = readJson(tree, "packages/plugins/plugin-rules/package.json");
    expect(packageJson).toMatchObject({
      name: "plugin-rules",
      nx: { tags: ["kind:plugin"] },
      scripts: {
        build: "tsc -p tsconfig.json",
        check: "tsc -p tsconfig.json --noEmit",
        test: "bun test",
      },
    });
  });

  test("accepts the kind-prefixed plugin kind", async () => {
    const tree = createProjectTree();

    await projectGenerator(tree, { name: "runtime-kit", kind: "kind:plugin" });

    expect(readJson(tree, "packages/plugins/plugin-runtime-kit/package.json")).toMatchObject({
      name: "plugin-runtime-kit",
      nx: { tags: ["kind:plugin"] },
    });
  });

  test("uses unscoped package names for generic Habitat scaffolds", async () => {
    const tree = createProjectTree();

    await projectGenerator(tree, { name: "runtime-kit", kind: "plugin" });

    expect(readJson(tree, "packages/plugins/plugin-runtime-kit/package.json")).toMatchObject({
      name: "plugin-runtime-kit",
      nx: { tags: ["kind:plugin"] },
    });
  });

  test.each([
    "app",
    "mod",
    "engine",
    "control",
    "adapter",
    "foundation",
    "sdk",
    "tooling",
  ])("refuses unsupported non-uniform kind %s before writes", async (kind) => {
    const tree = createProjectTree();

    await expect(projectGenerator(tree, { name: "swooper", kind })).rejects.toMatchObject({
      refusal: expect.objectContaining({
        kind: "scaffold-refusal",
        requestClass: "unsupported-project-kind",
        reason: "unsupported-project-kind",
        writeSet: [],
      }),
    });

    expect(tree.exists("mods/swooper/package.json")).toBe(false);
    expect(tree.exists("mods/swooper/src/index.ts")).toBe(false);
  });

  test("refuses unknown project kinds before writes", async () => {
    const tree = createProjectTree();

    await expect(
      projectGenerator(tree, { name: "swooper", kind: "host-specific" })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        kind: "scaffold-refusal",
        requestClass: "unsupported-project-kind",
        reason: "unsupported-project-kind",
        writeSet: [],
      }),
    });

    expect(tree.exists("mods/swooper/package.json")).toBe(false);
    expect(tree.exists("mods/swooper/src/index.ts")).toBe(false);
  });

  test.each([
    "recipe",
    "stage",
    "op",
    "step",
  ])("refuses product authoring field %s before writes", async (field) => {
    const tree = createProjectTree();
    const options = { name: "swooper", kind: "plugin", [field]: "standard" };

    await expect(projectGenerator(tree, options)).rejects.toMatchObject({
      refusal: expect.objectContaining({
        kind: "scaffold-refusal",
        requestClass: "unsupported-product-authoring",
        reason: "unsupported-product-authoring",
        writeSet: [],
      }),
    });

    expect(tree.exists("packages/plugins/plugin-swooper/package.json")).toBe(false);
    expect(tree.exists("packages/plugins/plugin-swooper/src/index.ts")).toBe(false);
  });

  test("refuses mismatched kind and root pairs before writes", async () => {
    const tree = createProjectTree();

    await expect(
      projectGenerator(tree, {
        name: "misplaced-app",
        kind: "plugin",
        directory: "packages/misplaced-app",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "root-mismatch",
        writeSet: [],
      }),
    });

    expect(tree.exists("packages/misplaced-app/package.json")).toBe(false);
    expect(tree.exists("packages/misplaced-app/src/index.ts")).toBe(false);
  });

  test("refuses mismatched package names before writes", async () => {
    const tree = createProjectTree();

    await expect(
      projectGenerator(tree, {
        name: "plugin-rules",
        kind: "plugin",
        packageName: "@scope/rules",
      })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "package-name-mismatch",
        writeSet: [],
      }),
    });

    expect(tree.exists("packages/plugins/plugin-rules/package.json")).toBe(false);
    expect(tree.exists("packages/plugins/plugin-rules/src/index.ts")).toBe(false);
  });

  test("refuses package name collisions before writes", async () => {
    const tree = createProjectTree();
    tree.write(
      "packages/existing/package.json",
      `${JSON.stringify({ name: "plugin-collision" })}\n`
    );

    await expect(
      projectGenerator(tree, { name: "collision", kind: "plugin" })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "package-name-collision",
        writeSet: [],
      }),
    });

    expect(tree.exists("packages/plugins/plugin-collision/package.json")).toBe(false);
    expect(tree.read("packages/existing/package.json", "utf8")).toBe(
      '{"name":"plugin-collision"}\n'
    );
  });

  test("refuses non-empty project roots before writes", async () => {
    const tree = createProjectTree();
    tree.write("packages/plugins/plugin-occupied/README.md", "occupied\n");

    await expect(
      projectGenerator(tree, { name: "occupied", kind: "plugin" })
    ).rejects.toMatchObject({
      refusal: expect.objectContaining({
        reason: "non-empty-root",
        writeSet: [],
      }),
    });

    expect(tree.read("packages/plugins/plugin-occupied/README.md", "utf8")).toBe("occupied\n");
    expect(tree.exists("packages/plugins/plugin-occupied/package.json")).toBe(false);
  });
});

function createProjectTree() {
  const tree = createTreeWithEmptyWorkspace();
  tree.write("apps/.keep", "");
  tree.write("mods/.keep", "");
  tree.write("packages/.keep", "");
  tree.write("tools/.keep", "");
  return tree;
}
