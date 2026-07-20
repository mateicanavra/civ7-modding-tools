import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7BattlefieldScanInputSchema,
  Civ7BattlefieldScanResultSchema,
  Civ7DestinationAnalysisInputSchema,
  type Civ7DestinationAnalysisResult,
  Civ7DestinationAnalysisResultSchema,
  Civ7TargetCandidatesInputSchema,
  Civ7TargetCandidatesResultSchema,
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7TargetCandidates,
} from "../src/index";

type FakeTacticalReadTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("tactical read wrappers", () => {
  test("exports TypeBox schemas for the neutral battlefield scan read atom", () => {
    expect(
      Value.Check(Civ7BattlefieldScanInputSchema, {
        origins: [{ x: 17, y: 20 }],
        radius: 8,
        maxPlayers: 12,
        maxUnits: 16,
        maxCities: 8,
      })
    ).toBe(true);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { radius: 33 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { maxPlayers: 129 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { maxUnits: 257 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { maxCities: 129 })).toBe(false);
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(
      false
    );
    expect(Value.Check(Civ7BattlefieldScanInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7BattlefieldScanInputSchema, { rawCommand: "readBattlefieldScan()" })
    ).toBe(false);

    const result = battlefieldScanResult();
    expect(Value.Check(Civ7BattlefieldScanResultSchema, result)).toBe(true);
    expect(
      Value.Check(Civ7BattlefieldScanResultSchema, {
        ...result,
        units: [
          {
            ...result.units[1],
            relationshipProof: "owner-mismatch",
          },
        ],
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7BattlefieldScanResultSchema, {
        ...result,
        owners: [
          {
            ...result.owners[1],
            relationshipLabel: "enemy",
          },
        ],
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7BattlefieldScanResultSchema, {
        ...result,
        rawCommand: "readBattlefieldScan()",
      })
    ).toBe(false);
  });

  test("exports TypeBox schemas for the neutral target-candidates read atom", () => {
    expect(
      Value.Check(Civ7TargetCandidatesInputSchema, {
        origins: [{ x: 18, y: 20 }],
        maxCandidates: 4,
        maxPlayers: 12,
        unitRadius: 3,
      })
    ).toBe(true);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { maxCandidates: 65 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { maxPlayers: 129 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { unitRadius: 17 })).toBe(false);
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { origins: [{ x: 1.5, y: 0 }] })).toBe(
      false
    );
    expect(Value.Check(Civ7TargetCandidatesInputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(
      Value.Check(Civ7TargetCandidatesInputSchema, { rawCommand: "readTargetCandidates()" })
    ).toBe(false);

    const result = targetCandidatesResult();
    expect(Value.Check(Civ7TargetCandidatesResultSchema, result)).toBe(true);
    expect(
      Value.Check(Civ7TargetCandidatesResultSchema, {
        ...result,
        relationshipLabelPolicy: {
          ...result.relationshipLabelPolicy,
          relationshipProof: "owner-mismatch",
        },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7TargetCandidatesResultSchema, {
        ...result,
        rawCommand: "readTargetCandidates()",
      })
    ).toBe(false);
  });

  test("exports TypeBox schemas for the neutral destination analysis read atom", () => {
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        playerId: 0,
        origin: { x: 20, y: 14 },
        destination: { x: 13, y: 17 },
        corridorRadius: 2,
        destinationRadius: 4,
        maxPlayers: 12,
        maxUnits: 16,
        maxCities: 8,
      })
    ).toBe(true);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        origin: { x: 20, y: 14 },
      })
    ).toBe(false);
    expect(Value.Check(Civ7DestinationAnalysisInputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(Civ7DestinationAnalysisInputSchema, { destination: { x: 1.5, y: 0 } })).toBe(
      false
    );
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        corridorRadius: 9,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        destinationRadius: 17,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        maxPlayers: 129,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        maxUnits: 257,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        maxCities: 129,
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        host: "127.0.0.1",
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisInputSchema, {
        destination: { x: 0, y: 0 },
        rawCommand: "readDestinationAnalysis()",
      })
    ).toBe(false);

    const result = destinationAnalysisResult();
    expect(result.corridor.units[0]?.corridorDistance).toBe(0);
    expect(result.corridor.units[0]?.destinationDistance).toBe(0);
    expect(result.destinationPressure.units[0]?.corridorDistance).toBe(0);
    expect(result.destinationPressure.units[0]?.destinationDistance).toBe(0);
    expect(Value.Check(Civ7DestinationAnalysisResultSchema, result)).toBe(true);
    expect(
      Value.Check(Civ7DestinationAnalysisResultSchema, {
        ...result,
        destinationPressure: {
          ...result.destinationPressure,
          units: [
            {
              ...result.destinationPressure.units[0],
              relationshipProof: "owner-mismatch",
            },
          ],
        },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisResultSchema, {
        ...result,
        destinationPressure: {
          ...result.destinationPressure,
          units: [
            {
              ...result.destinationPressure.units[0],
              relationshipLabel: "enemy",
            },
          ],
        },
      })
    ).toBe(false);
    expect(
      Value.Check(Civ7DestinationAnalysisResultSchema, {
        ...result,
        rawCommand: "readDestinationAnalysis()",
      })
    ).toBe(false);
  });

  test("reads target candidates as owner/proximity planning evidence", async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const { port } = server.address();
      const result = await getCiv7TargetCandidates(
        {
          origins: [{ x: 18, y: 20 }],
          maxCandidates: 4,
          maxPlayers: 12,
          unitRadius: 3,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(result).toMatchObject({
        host: "127.0.0.1",
        port,
        state: { id: "65535", name: "App UI" },
        localPlayerId: 0,
        playerId: 0,
        origins: [{ x: 18, y: 20 }],
        unitRadius: 3,
        hiddenInfoPolicy:
          "runtime-debug-summary; may include non-visible cities or units until paired with visibility reads",
        relationshipLabelPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
        },
      });
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0]).toMatchObject({
        owner: 9,
        cityCount: 2,
        unitCount: 4,
        nearestDistance: 5,
        nearestCity: {
          owner: 9,
          name: "Independent City",
          location: { x: 13, y: 17 },
        },
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeKind: "land",
          routeHint: "near-low-density",
          waterSampleCount: 0,
          landSampleCount: 6,
        },
      });
      expect(result.candidates[0]?.reasons).toEqual(
        expect.arrayContaining(["nearest target distance 5", "low nearby unit density"])
      );
      expectNoUnsupportedRelationshipClaims([
        result.hiddenInfoPolicy,
        ...result.notes,
        ...result.candidates.flatMap((candidate) => [
          ...candidate.reasons,
          candidate.approach.routeHint,
          candidate.approach.routeKind,
          ...candidate.approach.notes,
        ]),
      ]);
      expectReadOnlyAppUiRouting(server.received, "readTargetCandidates", [
        '"origins":[{"x":18,"y":20}]',
        '"maxCandidates":4',
        '"maxPlayers":12',
        '"unitRadius":3',
      ]);
    } finally {
      await server.close();
    }
  });

  test("reads battlefield scan without promoting owner mismatch to relationship proof", async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const { port } = server.address();
      const result = await getCiv7BattlefieldScan(
        {
          origins: [{ x: 17, y: 20 }],
          radius: 8,
          maxPlayers: 12,
          maxUnits: 16,
          maxCities: 8,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(result.relationshipLabelPolicy).toMatchObject({
        relationshipSource: "not-classified",
        relationshipProof: "none",
        unprovenLabel: "relationship-unproven",
      });
      expect(result).toMatchObject({
        localPlayerId: 0,
        playerId: 0,
        origins: [{ x: 17, y: 20 }],
        radius: 8,
      });

      expect(result.units.find((unit) => unit.owner === 0)).toMatchObject({
        relationshipProof: "self",
        relationshipLabel: "friendly",
      });
      for (const row of [
        ...result.units.filter((unit) => unit.owner !== 0),
        ...result.cities.filter((city) => city.owner !== 0),
        ...result.owners.filter((owner) => owner.owner !== 0),
      ]) {
        expect(row).toMatchObject({
          relationshipProof: "none",
          relationshipLabel: "relationship-unproven",
        });
      }
      expect(result.pointsOfInterest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "city-front",
            summary: "nearest relationship-unproven city in scan radius",
          }),
        ])
      );
      expectNoUnsupportedRelationshipClaims([
        result.hiddenInfoPolicy,
        ...result.notes,
        ...result.pointsOfInterest.map((point) => `${point.kind}: ${point.summary}`),
      ]);
      expectReadOnlyAppUiRouting(server.received, "readBattlefieldScan", [
        '"origins":[{"x":17,"y":20}]',
        '"radius":8',
        '"maxPlayers":12',
        '"maxUnits":16',
        '"maxCities":8',
      ]);
    } finally {
      await server.close();
    }
  });

  test("reads destination analysis as a planning lens with unproven relationship pressure", async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const { port } = server.address();
      const result = await getCiv7DestinationAnalysis(
        {
          origin: { x: 20, y: 14 },
          destination: { x: 13, y: 17 },
          corridorRadius: 2,
          destinationRadius: 4,
          maxPlayers: 12,
          maxUnits: 16,
          maxCities: 8,
        },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(result).toMatchObject({
        localPlayerId: 0,
        playerId: 0,
        relationshipLabelPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
        },
      });

      expect(result.corridor).toMatchObject({
        routeHint: "straight-line-grid-corridor",
        directGridDistance: 7,
        sampleCount: 8,
      });
      expect(result.destinationPressure).toMatchObject({
        unitCount: 1,
        cityCount: 1,
        apparentOtherStrength: 20,
      });
      for (const row of [
        ...result.destinationPressure.units,
        ...result.destinationPressure.cities,
      ]) {
        expect(row).toMatchObject({
          relationshipProof: "none",
          relationshipLabel: "relationship-unproven",
        });
      }
      expect(result.pointsOfInterest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "destination-city-pressure",
            summary: "relationship-unproven city near intended destination",
          }),
        ])
      );
      expectNoUnsupportedRelationshipClaims([
        result.hiddenInfoPolicy,
        ...result.notes,
        ...result.pointsOfInterest.map((point) => `${point.kind}: ${point.summary}`),
      ]);
      expectReadOnlyAppUiRouting(server.received, "readDestinationAnalysis", [
        '"origin":{"x":20,"y":14}',
        '"destination":{"x":13,"y":17}',
        '"corridorRadius":2',
        '"destinationRadius":4',
        '"maxPlayers":12',
        '"maxUnits":16',
        '"maxCities":8',
      ]);
    } finally {
      await server.close();
    }
  });

  test("rejects malformed battlefield evidence at the default wire parser", async () => {
    const server = await startTacticalReadTunerServer({ battlefield: { localPlayerId: 0 } });
    try {
      const { port } = server.address();
      await expect(
        getCiv7BattlefieldScan({}, { host: "127.0.0.1", port, timeoutMs: 1_000 })
      ).rejects.toMatchObject({ code: "command-failed" });
    } finally {
      await server.close();
    }
  });

  test("rejects malformed destination evidence at the default wire parser", async () => {
    const server = await startTacticalReadTunerServer({ destination: { localPlayerId: 0 } });
    try {
      const { port } = server.address();
      await expect(
        getCiv7DestinationAnalysis(
          { destination: { x: 13, y: 17 } },
          { host: "127.0.0.1", port, timeoutMs: 1_000 }
        )
      ).rejects.toMatchObject({ code: "command-failed" });
    } finally {
      await server.close();
    }
  });
});

async function startTacticalReadTunerServer(
  payloads: Partial<{
    battlefield: unknown;
    destination: unknown;
  }> = {}
): Promise<FakeTacticalReadTunerServer> {
  const received: string[] = [];
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message.includes("readDestinationAnalysis")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(payloads.destination ?? destinationAnalysisReadView()),
            ])
          );
        } else if (frame.message.includes("readTargetCandidates")) {
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify(targetCandidatesReadView())])
          );
        } else if (frame.message.includes("readBattlefieldScan")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(payloads.battlefield ?? battlefieldScanReadView()),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectReadOnlyAppUiRouting(
  received: string[],
  readFunction: string,
  expectedInputs: string[]
) {
  expect(received[0]).toBe("LSQ:");
  const read = received.find((message) => message.includes(readFunction));
  expect(read).toBeDefined();
  expect(read).toContain("CMD:65535:");
  for (const input of expectedInputs) expect(read).toContain(input);
  expect(received.some((message) => message.includes("sendRequest"))).toBe(false);
  expect(received.some((message) => message.includes("sendOperation("))).toBe(false);
}

function expectNoUnsupportedRelationshipClaims(values: string[]) {
  for (const value of values) {
    expect(value).not.toMatch(/\b(enemy|hostile|opponent|war|suzerain|ally|allied)\b/i);
  }
}

function targetCandidatesReadView() {
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 18, y: 20 }],
    unitRadius: 3,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible cities or units until paired with visibility reads",
    relationshipLabelPolicy: relationshipLabelPolicy(
      "Target candidates rank other owners from runtime city and unit summaries. They keep relationship labels unproven without official proof."
    ),
    candidates: [
      {
        owner: 9,
        leaderName: { ok: true, value: "Independent Power" },
        civilizationName: { ok: true, value: "Independent" },
        isHuman: { ok: true, value: false },
        cityCount: 2,
        unitCount: 4,
        cities: [
          {
            id: { owner: 9, id: 589824, type: 1 },
            owner: 9,
            name: "Independent City",
            location: { x: 13, y: 17 },
            population: 3,
            isTown: false,
            distance: 5,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
          {
            id: { owner: 9, id: 589825, type: 1 },
            owner: 9,
            name: "Second Independent City",
            location: { x: 11, y: 22 },
            population: 2,
            isTown: true,
            distance: 7,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
        ],
        nearestCity: {
          id: { owner: 9, id: 589824, type: 1 },
          owner: 9,
          name: "Independent City",
          location: { x: 13, y: 17 },
          population: 3,
          isTown: false,
        },
        nearestDistance: 5,
        nearbyUnits: [
          {
            id: { owner: 9, id: 196608, type: 26 },
            owner: 9,
            typeName: "UNIT_WARRIOR",
            location: { x: 13, y: 16 },
            damage: 0,
            strength: 20,
          },
        ],
        nearbyUnitCount: 4,
        apparentStrength: 42,
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeHint: "near-low-density",
          routeKind: "land",
          originWater: { ok: true, value: false },
          targetWater: { ok: true, value: false },
          waterSampleCount: 0,
          landSampleCount: 6,
          notes: [
            "Distance is a cheap grid heuristic for target ranking, not a pathfinder result.",
            "Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.",
          ],
        },
        reasons: ["nearest target distance 5", "low nearby unit density"],
      },
    ],
    notes: [
      "Read-only target shortlist. It ranks other-owner contacts and sends no operations.",
      "Owner mismatch is contact evidence only. Use relationship-unproven language unless official proof exists.",
    ],
  };
}

function targetCandidatesResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    ...targetCandidatesReadView(),
  };
}

function battlefieldScanResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    ...battlefieldScanReadView(),
  };
}

function battlefieldScanReadView() {
  const friendlyUnit = {
    id: { owner: 0, id: 458752, type: 26 },
    owner: 0,
    stance: "friendly",
    relationshipProof: "self",
    relationshipLabel: "friendly",
    type: 111,
    typeName: "UNIT_SLINGER",
    role: "ranged",
    location: { x: 17, y: 20 },
    distance: 0,
    nearestOrigin: { x: 17, y: 20 },
    damage: 36,
    wounded: true,
    strength: 9.6,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: "other",
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    type: 222,
    typeName: "UNIT_WARRIOR",
    role: "melee",
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const otherOwnerCity = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: "other",
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    name: "Independent City",
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    population: 3,
    isTown: false,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads",
    relationshipLabelPolicy: relationshipLabelPolicy(
      "Battlefield scan can prove owner ids and proximity, but keeps relationship status unproven without official proof."
    ),
    units: [friendlyUnit, otherOwnerUnit],
    cities: [otherOwnerCity],
    owners: [
      {
        owner: 0,
        stance: "friendly",
        relationshipProof: "self",
        relationshipLabel: "friendly",
        unitCount: 1,
        cityCount: 0,
        roles: { ranged: 1 },
        apparentStrength: 9.6,
        nearestUnit: friendlyUnit,
        nearestCity: null,
      },
      {
        owner: 9,
        stance: "other",
        relationshipProof: "none",
        relationshipLabel: "relationship-unproven",
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: otherOwnerUnit,
        nearestCity: otherOwnerCity,
      },
    ],
    pointsOfInterest: [
      {
        kind: "wounded-friendly",
        severity: "medium",
        location: friendlyUnit.location,
        summary: "friendly wounded unit near scan origin",
        units: [friendlyUnit],
      },
      {
        kind: "city-front",
        severity: "medium",
        location: otherOwnerCity.location,
        summary: "nearest relationship-unproven city in scan radius",
        cities: [otherOwnerCity],
      },
    ],
    notes: [
      "Read-only battlefield lens for tactical orientation. It does not path, move, attack, or validate operations.",
      "Owner mismatch is contact evidence, not relationship proof. Use relationship-unproven language unless official proof exists.",
    ],
  };
}

function destinationAnalysisReadView(): Omit<
  Civ7DestinationAnalysisResult,
  "host" | "port" | "state"
> {
  const otherOwnerUnit: Civ7DestinationAnalysisResult["corridor"]["units"][number] = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: "other",
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    type: 222,
    typeName: "UNIT_WARRIOR",
    role: "melee",
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
    corridorDistance: 0,
    destinationDistance: 0,
  };
  const otherOwnerDestinationUnit: Civ7DestinationAnalysisResult["destinationPressure"]["units"][number] =
    {
      ...otherOwnerUnit,
      destinationDistance: 0,
    };
  const otherOwnerCity: Civ7DestinationAnalysisResult["destinationPressure"]["cities"][number] = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: "other",
    relationshipProof: "none",
    relationshipLabel: "relationship-unproven",
    name: "Independent City",
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    population: 3,
    isTown: false,
    destinationDistance: 0,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 20, y: 14 },
    destination: { x: 13, y: 17 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy:
      "runtime-debug-summary; may include non-visible units, cities, or plot state until paired with visibility/map reads",
    relationshipLabelPolicy: relationshipLabelPolicy(
      "Destination analysis reports owner/proximity pressure and keeps relationship status unproven without official proof."
    ),
    corridor: {
      routeHint: "straight-line-grid-corridor",
      directGridDistance: 7,
      sampleCount: 8,
      sampledPlots: [
        {
          location: { x: 20, y: 14 },
          valid: { ok: true, value: true },
          water: { ok: true, value: true },
        },
      ],
      units: [otherOwnerUnit],
      unitCount: 1,
    },
    destinationPressure: {
      units: [otherOwnerDestinationUnit],
      unitCount: 1,
      cities: [otherOwnerCity],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: "destination-pressure",
        severity: "medium",
        location: otherOwnerDestinationUnit.location,
        summary: "1 other-owner unit near destination",
        units: [otherOwnerDestinationUnit],
      },
      {
        kind: "destination-city-pressure",
        severity: "high",
        location: otherOwnerCity.location,
        summary: "relationship-unproven city near intended destination",
        cities: [otherOwnerCity],
      },
    ],
    notes: [
      "Read-only destination lens for tactical planning. It does not move units, reserve paths, attack, or validate operations.",
      "The corridor is a straight-line grid approximation, not Civ7 engine pathfinding.",
      "Relationship labels are not classified here. Treat owner and proximity pressure as relationship-unproven until official proof exists.",
    ],
  };
}

function destinationAnalysisResult(): Civ7DestinationAnalysisResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    ...destinationAnalysisReadView(),
  };
}

function relationshipLabelPolicy(
  guidance: string
): Civ7DestinationAnalysisResult["relationshipLabelPolicy"] {
  return {
    relationshipSource: "not-classified",
    relationshipProof: "none",
    unprovenLabel: "relationship-unproven",
    guidance,
  };
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
