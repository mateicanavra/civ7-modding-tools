import { expect, test } from "vitest";
import { BaseFile } from "../src/files";

test("BaseFile.modInfoPath strips leading slash", () => {
  const file = new BaseFile({ path: "/foo/", name: "bar.xml", content: "data" });
  expect(file.modInfoPath).toBe("foo/bar.xml");
});

test("BaseFile.modInfoPath keeps relative path", () => {
  const file = new BaseFile({ path: "foo/", name: "bar.xml", content: "data" });
  expect(file.modInfoPath).toBe("foo/bar.xml");
});
