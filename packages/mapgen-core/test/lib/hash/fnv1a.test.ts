import { describe, expect, it } from "bun:test";
import { fnv1a32String, fnv1a32StringHex } from "@mapgen/lib/hash/index.js";

describe("lib/hash FNV-1a", () => {
  it("matches the canonical 32-bit ASCII vectors", () => {
    expect(fnv1a32String("")).toBe(0x811c9dc5);
    expect(fnv1a32String("a")).toBe(0xe40c292c);
    expect(fnv1a32String("foobar")).toBe(0xbf9cf968);
  });

  it("preserves the established UTF-16 code-unit recurrence", () => {
    expect(fnv1a32String("\u00e9")).toBe(0x6c0b6c44);
    expect(fnv1a32String("\ud83d\ude00")).toBe(0xcb31c4b8);
  });

  it("formats unsigned hashes as fixed-width lowercase hexadecimal", () => {
    expect(fnv1a32StringHex("")).toBe("811c9dc5");
    expect(fnv1a32StringHex("a")).toBe("e40c292c");
    expect(fnv1a32StringHex("RESOURCE_IRON")).toBe("c978d1f0");
  });
});
