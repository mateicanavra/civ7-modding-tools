import { describe, expect, it } from "bun:test";

import * as crustInit from "../../src/domain/foundation/artifacts/crust-init.artifact.js";
import * as crust from "../../src/domain/foundation/artifacts/crust.artifact.js";
import * as currentTectonics from "../../src/domain/foundation/artifacts/current-tectonics.artifact.js";
import * as mantleForcing from "../../src/domain/foundation/artifacts/mantle-forcing.artifact.js";
import * as mantlePotential from "../../src/domain/foundation/artifacts/mantle-potential.artifact.js";
import * as mesh from "../../src/domain/foundation/artifacts/mesh.artifact.js";
import * as plateGraph from "../../src/domain/foundation/artifacts/plate-graph.artifact.js";
import * as plateIdByEra from "../../src/domain/foundation/artifacts/plate-id-by-era.artifact.js";
import * as plateMotion from "../../src/domain/foundation/artifacts/plate-motion.artifact.js";
import * as plateTopology from "../../src/domain/foundation/artifacts/plate-topology.artifact.js";
import * as tectonicEraFields from "../../src/domain/foundation/artifacts/tectonic-era-fields.artifact.js";
import * as tectonicEvents from "../../src/domain/foundation/artifacts/tectonic-events.artifact.js";
import * as tectonicHistory from "../../src/domain/foundation/artifacts/tectonic-history.artifact.js";
import * as tectonicProvenance from "../../src/domain/foundation/artifacts/tectonic-provenance.artifact.js";
import * as tectonicSegments from "../../src/domain/foundation/artifacts/tectonic-segments.artifact.js";
import * as tracerIndexByEra from "../../src/domain/foundation/artifacts/tracer-index-by-era.artifact.js";

type ArtifactModule = Readonly<{
  Schema: unknown;
  artifact: Readonly<{ id: string; name: string; schema: unknown }>;
  validate: (value: unknown) => readonly { message: string }[];
}>;

function messages(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join("\n");
}

function expectValid(module: ArtifactModule, value: unknown): void {
  expect(module.validate(value)).toEqual([]);
}

function expectInvalid(module: ArtifactModule, value: unknown, pattern: RegExp): void {
  expect(() => module.validate(value)).not.toThrow();
  const issues = module.validate(value);
  expect(issues.length).toBeGreaterThan(0);
  expect(Object.isFrozen(issues)).toBe(true);
  expect(messages(issues)).toMatch(pattern);
}

function expectInvalidWithoutMutation(
  module: ArtifactModule,
  value: unknown,
  pattern: RegExp
): void {
  const before = snapshotPayload(value);
  expectInvalid(module, value, pattern);
  expect(snapshotPayload(value)).toBe(before);
}

function snapshotPayload(value: unknown): string {
  return JSON.stringify(value, (_key, candidate) => {
    if (ArrayBuffer.isView(candidate)) {
      return {
        ctor: candidate.constructor.name,
        values: Array.from(candidate as ArrayLike<number>),
      };
    }
    return candidate;
  });
}

const cellCount = 3;
const eraCount = 5;
const plateCount = 2;

function f32(length = cellCount): Float32Array {
  return new Float32Array(length).fill(1);
}

function u8(length = cellCount): Uint8Array {
  return new Uint8Array(length).fill(1);
}

function i8(length = cellCount): Int8Array {
  return new Int8Array(length).fill(1);
}

function u32(length = cellCount): Uint32Array {
  return new Uint32Array(length).fill(1);
}

function i16(length = cellCount): Int16Array {
  return new Int16Array(length).fill(1);
}

function i32(length = cellCount): Int32Array {
  return new Int32Array(length).fill(1);
}

function validMesh() {
  return {
    cellCount,
    wrapWidth: 128,
    siteX: f32(),
    siteY: f32(),
    neighborsOffsets: new Int32Array([0, 1, 2, 3]),
    neighbors: i32(),
    areas: f32(),
    bbox: { xl: 0, xr: 128, yt: 0, yb: 64 },
  };
}

function validCrust() {
  return {
    maturity: f32(),
    thickness: f32(),
    thermalAge: u8(),
    damage: u8(),
    type: u8(),
    age: u8(),
    buoyancy: f32(),
    baseElevation: f32(),
    strength: f32(),
  };
}

function validMantlePotential() {
  return {
    version: 1,
    cellCount,
    potential: f32(),
    sourceCount: 2,
    sourceType: i8(2),
    sourceCell: u32(2),
    sourceAmplitude: f32(2),
    sourceRadius: f32(2),
  };
}

function validMantleForcing() {
  return {
    version: 1,
    cellCount,
    stress: f32(),
    forcingU: f32(),
    forcingV: f32(),
    forcingMag: f32(),
    upwellingClass: i8(),
    divergence: f32(),
  };
}

function validPlateGraph() {
  return {
    cellToPlate: i16(),
    plates: [
      { id: 0, role: "tectonic", kind: "major", seedX: 1, seedY: 2 },
      { id: 1, role: "polarCap", kind: "minor", seedX: 3, seedY: 4 },
    ],
  };
}

function validPlateMotion() {
  return {
    version: 1,
    cellCount,
    plateCount,
    plateCenterX: f32(plateCount),
    plateCenterY: f32(plateCount),
    plateVelocityX: f32(plateCount),
    plateVelocityY: f32(plateCount),
    plateOmega: f32(plateCount),
    plateFitRms: f32(plateCount),
    plateFitP90: f32(plateCount),
    plateQuality: u8(plateCount),
    cellFitError: u8(),
  };
}

function validPlateTopology() {
  return {
    plateCount,
    plates: [
      { id: 0, area: 2, centroid: { x: 1, y: 2 }, neighbors: [1] },
      { id: 1, area: 1, centroid: { x: 3, y: 4 }, neighbors: [0] },
    ],
  };
}

function validCurrentTectonics() {
  return {
    boundaryType: u8(),
    upliftPotential: u8(),
    riftPotential: u8(),
    shearStress: u8(),
    volcanism: u8(),
    fracture: u8(),
    cumulativeUplift: u8(),
  };
}

function validTectonicSegments() {
  return {
    segmentCount: 2,
    aCell: i32(2),
    bCell: i32(2),
    plateA: i16(2),
    plateB: i16(2),
    regime: u8(2),
    polarity: i8(2),
    compression: u8(2),
    extension: u8(2),
    shear: u8(2),
    volcanism: u8(2),
    fracture: u8(2),
    driftU: i8(2),
    driftV: i8(2),
  };
}

function validEraFields() {
  return {
    boundaryType: u8(),
    boundaryPolarity: i8(),
    boundaryIntensity: u8(),
    upliftPotential: u8(),
    collisionPotential: u8(),
    subductionPotential: u8(),
    riftPotential: u8(),
    shearStress: u8(),
    volcanism: u8(),
    fracture: u8(),
    riftOriginPlate: i16(),
    volcanismOriginPlate: i16(),
    volcanismEventType: u8(),
    boundaryDriftU: i8(),
    boundaryDriftV: i8(),
  };
}

function validHistoryEra() {
  const {
    boundaryPolarity: _boundaryPolarity,
    boundaryIntensity: _boundaryIntensity,
    riftOriginPlate: _riftOriginPlate,
    volcanismOriginPlate: _volcanismOriginPlate,
    volcanismEventType: _volcanismEventType,
    boundaryDriftU: _boundaryDriftU,
    boundaryDriftV: _boundaryDriftV,
    ...historyFields
  } = validEraFields();
  return historyFields;
}

function validTectonicHistory() {
  return {
    eraCount,
    eras: Array.from({ length: eraCount }, validHistoryEra),
    plateIdByEra: Array.from({ length: eraCount }, () => i16()),
    upliftTotal: u8(),
    collisionTotal: u8(),
    subductionTotal: u8(),
    fractureTotal: u8(),
    volcanismTotal: u8(),
    upliftRecentFraction: u8(),
    collisionRecentFraction: u8(),
    subductionRecentFraction: u8(),
    lastActiveEra: u8(),
    lastCollisionEra: u8(),
    lastSubductionEra: u8(),
  };
}

function validTectonicProvenance() {
  return {
    version: 1,
    eraCount,
    cellCount,
    tracerIndex: Array.from({ length: eraCount }, () => u32()),
    provenance: {
      originEra: u8(),
      originPlateId: i16(),
      lastBoundaryEra: u8(),
      lastBoundaryType: u8(),
      lastBoundaryPolarity: i8(),
      lastBoundaryIntensity: u8(),
      crustAge: u8(),
    },
  };
}

function validEvent() {
  return {
    eventType: 1,
    plateA: 0,
    plateB: 1,
    polarity: -1,
    intensityUplift: 10,
    intensityRift: 20,
    intensityShear: 30,
    intensityVolcanism: 40,
    intensityFracture: 50,
    driftU: -3,
    driftV: 4,
    seedCells: [0, 1],
    originPlateId: 0,
  };
}

describe("foundation artifact contract files", () => {
  it("validates direct foundation artifact payloads without mutating or throwing", () => {
    const validPayloads: readonly (readonly [ArtifactModule, unknown])[] = [
      [mesh, validMesh()],
      [crust, validCrust()],
      [crustInit, validCrust()],
      [mantlePotential, validMantlePotential()],
      [mantleForcing, validMantleForcing()],
      [plateGraph, validPlateGraph()],
      [plateMotion, validPlateMotion()],
      [plateTopology, validPlateTopology()],
      [tectonicSegments, validTectonicSegments()],
      [currentTectonics, validCurrentTectonics()],
      [tectonicHistory, validTectonicHistory()],
      [tectonicProvenance, validTectonicProvenance()],
      [tectonicEvents, [validEvent()]],
      [tectonicEraFields, [validEraFields()]],
      [plateIdByEra, Array.from({ length: eraCount }, () => i16())],
      [tracerIndexByEra, Array.from({ length: eraCount }, () => u32())],
    ];

    for (const [module, payload] of validPayloads) {
      expectValid(module, payload);
    }

    const crustPayload = validCrust();
    const before = crustPayload.type;
    expectValid(crust, crustPayload);
    expect(crustPayload.type).toBe(before);
  });

  it("reports invalid count and range scalars without repairing payloads", () => {
    expectInvalidWithoutMutation(
      mantlePotential,
      { ...validMantlePotential(), sourceCount: -1 },
      /sourceCount|sourceType/
    );
    expectInvalidWithoutMutation(
      mantlePotential,
      { ...validMantlePotential(), sourceCount: 3 },
      /sourceType|sourceCell|sourceAmplitude|sourceRadius/
    );
    expectInvalidWithoutMutation(
      plateMotion,
      { ...validPlateMotion(), plateCount: 0 },
      /plateCount|plateCenterX/
    );

    const lowEraHistory = {
      ...validTectonicHistory(),
      eraCount: 4,
      eras: Array.from({ length: 4 }, validHistoryEra),
      plateIdByEra: Array.from({ length: 4 }, () => i16()),
    };
    expectInvalidWithoutMutation(tectonicHistory, lowEraHistory, /eraCount/);

    const highEraProvenance = {
      ...validTectonicProvenance(),
      eraCount: 9,
      tracerIndex: Array.from({ length: 9 }, () => u32()),
    };
    expectInvalidWithoutMutation(tectonicProvenance, highEraProvenance, /eraCount/);
  });

  it("does not mutate or repair invalid constructor and length failures", () => {
    expectInvalidWithoutMutation(
      crust,
      { ...validCrust(), strength: f32(cellCount - 1) },
      /strength/
    );
    expectInvalidWithoutMutation(
      currentTectonics,
      { ...validCurrentTectonics(), shearStress: f32() },
      /shearStress/
    );
    expectInvalidWithoutMutation(
      tectonicEvents,
      [{ ...validEvent(), seedCells: [-1], driftU: -128 }],
      /seedCells|driftU/
    );
  });

  it("reports invalid mesh, crust, mantle, plate, and current tectonics payloads", () => {
    expectInvalid(mesh, { ...validMesh(), wrapWidth: Number.NaN }, /wrapWidth/);
    expectInvalid(mesh, { ...validMesh(), neighborsOffsets: new Int32Array([0, 1]) }, /offset/i);
    expectInvalid(crust, { ...validCrust(), type: new Float32Array(cellCount) }, /type/);
    expectInvalid(crust, { ...validCrust(), strength: f32(cellCount - 1) }, /strength/);
    expectInvalid(
      mantlePotential,
      { ...validMantlePotential(), sourceAmplitude: f32(1) },
      /sourceAmplitude/
    );
    expectInvalid(
      mantleForcing,
      { ...validMantleForcing(), upwellingClass: u8() },
      /upwellingClass/
    );
    expectInvalid(plateGraph, { ...validPlateGraph(), plates: [] }, /plates/);
    expectInvalid(
      plateGraph,
      { ...validPlateGraph(), plates: [{ id: 0, role: "other" }] },
      /plates/
    );
    expectInvalid(plateMotion, { ...validPlateMotion(), plateVelocityX: f32(1) }, /plateVelocityX/);
    expectInvalid(
      plateTopology,
      {
        ...validPlateTopology(),
        plates: [
          { id: 1, area: 2, centroid: { x: 1, y: 2 }, neighbors: [] },
          { id: 1, area: 1, centroid: { x: 3, y: 4 }, neighbors: [0] },
        ],
      },
      /id/
    );
    expectInvalid(tectonicSegments, { ...validTectonicSegments(), driftV: i8(1) }, /driftV/);
    expectInvalid(
      currentTectonics,
      { ...validCurrentTectonics(), shearStress: f32() },
      /shearStress/
    );
  });

  it("reports invalid tectonic history, provenance, event, and per-era payloads", () => {
    expectInvalid(
      tectonicHistory,
      { ...validTectonicHistory(), eras: [validHistoryEra()] },
      /eraCount|eras/
    );
    expectInvalid(
      tectonicHistory,
      { ...validTectonicHistory(), plateIdByEra: [i16()] },
      /plateIdByEra/
    );
    expectInvalid(
      tectonicHistory,
      {
        ...validTectonicHistory(),
        eras: [{ ...validHistoryEra(), upliftPotential: u8(cellCount - 1) }],
      },
      /upliftPotential/
    );
    expectInvalid(
      tectonicProvenance,
      { ...validTectonicProvenance(), tracerIndex: [u32()] },
      /tracerIndex/
    );
    expectInvalid(
      tectonicProvenance,
      {
        ...validTectonicProvenance(),
        provenance: { ...validTectonicProvenance().provenance, originPlateId: u8() },
      },
      /originPlateId/
    );
    expectInvalid(tectonicEvents, [{ ...validEvent(), driftU: -128 }], /driftU/);
    expectInvalid(
      tectonicEraFields,
      [{ ...validEraFields(), boundaryDriftV: f32() }],
      /boundaryDriftV/
    );
    expectInvalid(plateIdByEra, [i16(), i16(cellCount - 1)], /plateIdByEra|era/i);
    expectInvalid(tracerIndexByEra, [u32(), i32()], /tracerIndexByEra|era/i);
  });
});
