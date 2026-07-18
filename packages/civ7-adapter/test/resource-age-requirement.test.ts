import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "../src/mock-adapter.js";
import { queryCiv7ResourceRequirementForAge } from "../src/resource-age-policy.js";

describe("Civ7 resource age policy query", () => {
  it("hashes the symbolic age and preserves true and false engine answers", () => {
    const calls: Array<[number, number]> = [];
    const runtime = {
      Database: {
        makeHash: (ageType: string) => {
          expect(ageType).toBe("AGE_ANTIQUITY");
          return 731;
        },
      },
      ResourceBuilder: {
        isResourceRequiredForAge: (resourceTypeId: number, ageHash: number) => {
          calls.push([resourceTypeId, ageHash]);
          return resourceTypeId === 11;
        },
      },
    };

    expect(queryCiv7ResourceRequirementForAge(runtime, 11, "AGE_ANTIQUITY")).toBe(true);
    expect(queryCiv7ResourceRequirementForAge(runtime, 12, "AGE_ANTIQUITY")).toBe(false);
    expect(calls).toEqual([
      [11, 731],
      [12, 731],
    ]);
  });

  it("returns null when either runtime surface is unavailable", () => {
    expect(queryCiv7ResourceRequirementForAge({}, 11, "AGE_ANTIQUITY")).toBeNull();
    expect(
      queryCiv7ResourceRequirementForAge({ Database: { makeHash: () => 731 } }, 11, "AGE_ANTIQUITY")
    ).toBeNull();
    expect(
      queryCiv7ResourceRequirementForAge(
        { ResourceBuilder: { isResourceRequiredForAge: () => true } },
        11,
        "AGE_ANTIQUITY"
      )
    ).toBeNull();
  });

  it("throws instead of accepting a non-boolean engine answer", () => {
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: { makeHash: () => 731 },
          ResourceBuilder: { isResourceRequiredForAge: () => "true" },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(TypeError);
  });

  it("propagates errors from hashing and policy invocation", () => {
    const hashError = new Error("hash failed");
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: {
            makeHash: () => {
              throw hashError;
            },
          },
          ResourceBuilder: { isResourceRequiredForAge: () => true },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(hashError);

    const policyError = new Error("policy failed");
    expect(() =>
      queryCiv7ResourceRequirementForAge(
        {
          Database: { makeHash: () => 731 },
          ResourceBuilder: {
            isResourceRequiredForAge: () => {
              throw policyError;
            },
          },
        },
        11,
        "AGE_ANTIQUITY"
      )
    ).toThrow(policyError);
  });
});

describe("MockAdapter resource age policy", () => {
  it("returns null without a hook and preserves true, false, and null hook answers", () => {
    expect(createMockAdapter().isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBeNull();

    const adapter = createMockAdapter({
      isResourceRequiredForAge: (resourceTypeId, ageType) => {
        expect(ageType).toBe("AGE_ANTIQUITY");
        if (resourceTypeId === 11) return true;
        if (resourceTypeId === 12) return false;
        return null;
      },
    });

    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(true);
    expect(adapter.isResourceRequiredForAge(12, "AGE_ANTIQUITY")).toBe(false);
    expect(adapter.isResourceRequiredForAge(13, "AGE_ANTIQUITY")).toBeNull();
  });

  it("propagates hook errors", () => {
    const policyError = new Error("mock policy failed");
    const adapter = createMockAdapter({
      isResourceRequiredForAge: () => {
        throw policyError;
      },
    });

    expect(() => adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toThrow(policyError);
  });

  it("preserves its hook across reset and replaces it when reset supplies one", () => {
    const adapter = createMockAdapter({ isResourceRequiredForAge: () => true });

    adapter.reset();
    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(true);

    adapter.reset({ isResourceRequiredForAge: () => false });
    expect(adapter.isResourceRequiredForAge(11, "AGE_ANTIQUITY")).toBe(false);
  });
});
