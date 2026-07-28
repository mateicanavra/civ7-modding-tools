import { describe, expect, it } from "bun:test";

import foundation from "../../../../../../src/domain/foundation/router.js";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { computeTectonicSegments } = foundation.tectonics.ops;

const selection = computeTectonicSegments.normalize({
  strategy: "relative-motion-regimes",
  config: {
    ...computeTectonicSegments.defaultConfig.config,
    intensityScale: 120,
  },
});

function twoCellBoundary(params?: {
  crustTypes?: readonly [number, number];
  strengths?: readonly [number, number];
  velocityB?: Readonly<{ x?: number; y?: number; omega?: number }>;
}) {
  const velocityB = params?.velocityB ?? {};
  return {
    mesh: {
      cellCount: 2,
      wrapWidth: 10,
      siteX: new Float32Array([0, 1]),
      siteY: new Float32Array([0, 0]),
      neighborsOffsets: new Int32Array([0, 1, 2]),
      neighbors: new Int32Array([1, 0]),
    },
    crust: {
      strength: new Float32Array(params?.strengths ?? [0.2, 0.2]),
      type: new Uint8Array(params?.crustTypes ?? [0, 0]),
    },
    plateGraph: {
      cellToPlate: new Int16Array([0, 1]),
      plates: [
        { id: 0, role: "tectonic", kind: "major", seedX: 0, seedY: 0 },
        { id: 1, role: "tectonic", kind: "major", seedX: 1, seedY: 0 },
      ] as const,
    },
    plateMotion: {
      plateCount: 2,
      plateCenterX: new Float32Array([0, 1]),
      plateCenterY: new Float32Array([0, 0]),
      plateVelocityX: new Float32Array([0, velocityB.x ?? 0]),
      plateVelocityY: new Float32Array([0, velocityB.y ?? 0]),
      plateOmega: new Float32Array([0, velocityB.omega ?? 0]),
    },
  } as const;
}

function computeSegments(input: ReturnType<typeof twoCellBoundary>) {
  return computeTectonicSegments.run(input, selection).segments;
}

describe("foundation/compute-tectonic-segments", () => {
  it("refuses motion for a different plate graph before classification", () => {
    const input = twoCellBoundary();
    const mismatched = {
      ...input,
      plateMotion: { ...input.plateMotion, plateCount: 1 },
    } as const;

    let refusal: unknown;
    try {
      computeTectonicSegments.run(mismatched, selection);
    } catch (error) {
      refusal = error;
    }

    expect(refusal).toBeInstanceOf(OperationInputAdmissionError);
    expect(refusal).toMatchObject({
      issues: [
        expect.objectContaining({
          keyword: "~refine",
          message: "Plate-motion plate count must match the admitted plate graph.",
        }),
      ],
    });
  });

  it("includes rigid plate rotation when classifying shear", () => {
    const withoutRotation = computeSegments(twoCellBoundary());
    const withRotation = computeSegments(twoCellBoundary({ velocityB: { omega: 1 } }));

    expect(withoutRotation.shear[0]).toBe(0);
    expect(withRotation.shear[0]).toBeGreaterThan(0);
    expect(withRotation.regime[0]).toBe(BOUNDARY_TYPE.transform);
  });

  it("assigns convergent polarity to the oceanic plate beneath continental crust", () => {
    const segments = computeSegments(
      twoCellBoundary({
        crustTypes: [0, 1],
        strengths: [0.2, 0.9],
        velocityB: { x: -1 },
      })
    );

    expect(segments.regime[0]).toBe(BOUNDARY_TYPE.convergent);
    expect(segments.polarity[0]).toBe(-1);
  });

  it("uses oceanic strength contrast to bootstrap polarity and arc volcanism", () => {
    const withContrast = computeSegments(
      twoCellBoundary({
        strengths: [0.2, 0.9],
        velocityB: { x: -1 },
      })
    );
    const withoutContrast = computeSegments(
      twoCellBoundary({
        strengths: [0.55, 0.55],
        velocityB: { x: -1 },
      })
    );

    expect(withContrast.regime[0]).toBe(BOUNDARY_TYPE.convergent);
    expect(withContrast.polarity[0]).toBe(-1);
    expect(withContrast.compression[0]).toBe(withoutContrast.compression[0]);
    expect((withContrast.volcanism[0] ?? 0) - (withoutContrast.volcanism[0] ?? 0)).toBe(40);
  });

  it("makes stronger crust resist convergent compression more intensely", () => {
    const strong = computeSegments(
      twoCellBoundary({
        strengths: [0.9, 0.9],
        velocityB: { x: -1 },
      })
    );
    const weak = computeSegments(
      twoCellBoundary({
        strengths: [0.1, 0.1],
        velocityB: { x: -1 },
      })
    );

    expect(strong.compression[0]).toBeGreaterThan(weak.compression[0] ?? 0);
  });
});
