import { describe, expect, it } from "bun:test";
import {
  fnv1a32Int32Values,
  fnv1a32Int32ValuesHex,
  fnv1a32String,
  fnv1a32StringHex,
} from "@mapgen/lib/hash/index.js";

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

  it("mixes each int32 as four canonical little-endian bytes", () => {
    expect(fnv1a32Int32Values([])).toBe(0x811c9dc5);
    expect(fnv1a32Int32Values([0])).toBe(0x4b95f515);
    expect(fnv1a32Int32Values([1])).toBe(0xfb69b604);
    expect(fnv1a32Int32Values([-1])).toBe(0xe3160fb1);
    expect(fnv1a32Int32Values([0x12345678])).toBe(0xa3649785);
  });

  it("preserves the established typed-array evidence recurrence", () => {
    expect(fnv1a32Int32ValuesHex(new Int16Array([-1, 0, 32767]))).toBe("1badf617");
    expect(fnv1a32Int32ValuesHex(new Uint8Array([1, 2, 3]))).toBe("794671b5");
  });
});
