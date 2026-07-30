import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  Civ7ComponentIdSchema,
} from "../../civ7-component-id.js";
import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

const Civ7UnitTargetJsonValueSchema = Type.Cyclic(
  {
    Civ7UnitTargetJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7UnitTargetJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7UnitTargetJsonValue")),
    ]),
  },
  "Civ7UnitTargetJsonValue"
);

const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const nullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const nullableJsonValueSchema = Type.Union([Civ7UnitTargetJsonValueSchema, Type.Null()]);
const mapLocationSchema = Type.Object(
  {
    x: Type.Integer(),
    y: Type.Integer(),
  },
  { additionalProperties: false }
);
const nullableMapLocationSchema = Type.Union([mapLocationSchema, Type.Null()]);

/** Closed actions considered by Civ7's native right-click unit-target decision. */
export const Civ7UnitTargetActionIdSchema = Type.Union([
  Type.Literal("naval-attack"),
  Type.Literal("air-attack"),
  Type.Literal("ranged-attack"),
  Type.Literal("army-overrun"),
  Type.Literal("swap-units"),
  Type.Literal("move-to"),
]);
export type Civ7UnitTargetActionId = Static<typeof Civ7UnitTargetActionIdSchema>;

/** Unit and plot identity shared by unit-target observation and action checks. */
export const Civ7UnitTargetInputSchema = Type.Object(
  {
    unitId: Civ7ComponentIdSchema,
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetInput = Readonly<Static<typeof Civ7UnitTargetInputSchema>>;

/** Observation input that can retain pre-dispatch target identities across later reads. */
export const Civ7UnitTargetObservationInputSchema = Type.Object(
  {
    ...Civ7UnitTargetInputSchema.properties,
    trackedUnitIds: Type.Optional(Type.Array(Civ7ComponentIdSchema)),
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetObservationInput = Readonly<
  Static<typeof Civ7UnitTargetObservationInputSchema>
>;

const Civ7UnitTargetUnitSummarySchema = Type.Object(
  {
    id: Civ7ComponentIdSchema,
    location: nullableMapLocationSchema,
    movementMovesRemaining: nullableNumberSchema,
    movementTurnsRemaining: nullableNumberSchema,
    attacksRemaining: nullableNumberSchema,
    damage: nullableNumberSchema,
    hitPoints: nullableNumberSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetUnitSummary = Readonly<Static<typeof Civ7UnitTargetUnitSummarySchema>>;

const Civ7UnitTargetTrackedUnitSchema = Type.Object(
  {
    id: Civ7ComponentIdSchema,
    unit: Type.Union([Civ7UnitTargetUnitSummarySchema, Type.Null()]),
  },
  { additionalProperties: false }
);

const Civ7UnitTargetWarObservationSchema = Type.Object(
  {
    observed: Type.Boolean(),
    result: nullableJsonValueSchema,
    player2: nullableIntegerSchema,
    noPlayerId: nullableIntegerSchema,
    required: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false }
);

/** Focused immutable runtime evidence used for stale-state and postcondition checks. */
export const Civ7UnitTargetSnapshotSchema = Type.Object(
  {
    localPlayerId: nullableIntegerSchema,
    unitId: Civ7ComponentIdSchema,
    target: Type.Object(
      {
        x: Type.Integer(),
        y: Type.Integer(),
        index: nullableIntegerSchema,
      },
      { additionalProperties: false }
    ),
    actor: Type.Union([Civ7UnitTargetUnitSummarySchema, Type.Null()]),
    targetUnits: Type.Array(Civ7UnitTargetUnitSummarySchema),
    trackedTargetUnits: Type.Array(Civ7UnitTargetTrackedUnitSchema),
    combatType: nullableJsonValueSchema,
    rangedCombatType: nullableJsonValueSchema,
    war: Civ7UnitTargetWarObservationSchema,
    modifiers: Type.Object(
      {
        none: nullableIntegerSchema,
        dispatch: nullableIntegerSchema,
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetSnapshot = Readonly<Static<typeof Civ7UnitTargetSnapshotSchema>>;

const Civ7UnitTargetActionPrerequisiteSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("none"),
      Type.Literal("ranged-combat"),
      Type.Literal("off-current-tile"),
    ]),
    satisfied: Type.Boolean(),
  },
  { additionalProperties: false }
);

const Civ7UnitTargetActionArgsSchema = Type.Object(
  {
    X: Type.Integer(),
    Y: Type.Integer(),
    Modifiers: Type.Integer(),
  },
  { additionalProperties: false }
);

/** One exact native action check; it does not select among actions. */
export const Civ7UnitTargetActionCheckResultSchema = Type.Object(
  {
    actionId: Civ7UnitTargetActionIdSchema,
    valid: Type.Boolean(),
    prerequisite: Civ7UnitTargetActionPrerequisiteSchema,
    args: Civ7UnitTargetActionArgsSchema,
    result: nullableJsonValueSchema,
    snapshot: Civ7UnitTargetSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionCheckResult = Readonly<
  Static<typeof Civ7UnitTargetActionCheckResultSchema>
>;

/** Closed input for checking one native unit-target action. */
export const Civ7UnitTargetActionCheckInputSchema = Type.Object(
  {
    ...Civ7UnitTargetInputSchema.properties,
    actionId: Civ7UnitTargetActionIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionCheckInput = Readonly<
  Static<typeof Civ7UnitTargetActionCheckInputSchema>
>;

/** Guarded send input carrying the exact action check admitted by the service. */
export const Civ7UnitTargetActionSendInputSchema = Type.Object(
  {
    ...Civ7UnitTargetActionCheckInputSchema.properties,
    expected: Civ7UnitTargetActionCheckResultSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionSendInput = Readonly<
  Static<typeof Civ7UnitTargetActionSendInputSchema>
>;

/** Native dispatch evidence; `sent` means the native method was invoked. */
export const Civ7UnitTargetActionSendResultSchema = Type.Object(
  {
    sent: Type.Boolean(),
    actionId: Civ7UnitTargetActionIdSchema,
    validation: Civ7UnitTargetActionCheckResultSchema,
    before: Civ7UnitTargetSnapshotSchema,
    after: Civ7UnitTargetSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionSendResult = Readonly<
  Static<typeof Civ7UnitTargetActionSendResultSchema>
>;

const Civ7UnitTargetActionSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7UnitTargetActionSendResultSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      gameplayDispatchStatus: Type.Union([
        Type.Literal("not-dispatched"),
        Type.Literal("dispatched"),
      ]),
      error: Type.String({ maxLength: 512 }),
    },
    { additionalProperties: false }
  ),
]);

/** Reads focused unit and target evidence without selecting or sending an action. */
export async function observeCiv7UnitTarget(
  input: Civ7UnitTargetObservationInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitTargetSnapshot> {
  const wireInput = admittedUnitTargetObservationInput(input);
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitTargetWireCommand("observeUnitTarget", wireInput),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 unit target observation",
    Civ7UnitTargetSnapshotSchema
  );
}

/** Checks one closed native action with its exact right-click arguments and prerequisite. */
export async function checkCiv7UnitTargetAction(
  input: Civ7UnitTargetActionCheckInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitTargetActionCheckResult> {
  const wireInput = admittedUnitTargetCheckInput(input);
  const command = await executeCiv7TunerCommand({
    ...options,
    command: buildUnitTargetWireCommand("checkUnitTargetAction", wireInput),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 unit target action check",
    Civ7UnitTargetActionCheckResultSchema
  );
}

/** Freshly revalidates and invokes one service-admitted native action at most once. */
export async function sendCiv7UnitTargetAction(
  input: Civ7UnitTargetActionSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7UnitTargetActionSendResult> {
  const wireInput = admittedUnitTargetSendInput(input);
  let command: Awaited<ReturnType<typeof executeCiv7TunerCommand>>;
  let envelope: Static<typeof Civ7UnitTargetActionSendEnvelopeSchema>;
  try {
    command = await executeCiv7TunerCommand({
      ...options,
      command: buildUnitTargetWireCommand("sendUnitTargetAction", wireInput),
    });
    envelope = schemaBodyFromCommandResult(
      command,
      "Civ7 unit target action send",
      Civ7UnitTargetActionSendEnvelopeSchema
    );
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "indeterminate");
  }
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type UnitTargetWireAtom = "observeUnitTarget" | "checkUnitTargetAction" | "sendUnitTargetAction";

function buildUnitTargetWireCommand(
  atom: "observeUnitTarget",
  input: Civ7UnitTargetObservationInput
): string;
function buildUnitTargetWireCommand(
  atom: "checkUnitTargetAction",
  input: Civ7UnitTargetActionCheckInput
): string;
function buildUnitTargetWireCommand(
  atom: "sendUnitTargetAction",
  input: Civ7UnitTargetActionSendInput
): string;
function buildUnitTargetWireCommand(
  atom: UnitTargetWireAtom,
  input: Civ7UnitTargetInput | Civ7UnitTargetActionCheckInput | Civ7UnitTargetActionSendInput
): string {
  const invocation =
    atom === "observeUnitTarget"
      ? `observeUnitTarget(${jsLiteral(input)}, ${jsLiteral(
          "trackedUnitIds" in input ? (input.trackedUnitIds ?? null) : null
        )})`
      : `${atom}(${jsLiteral(input)})`;
  return `(() => {
    ${unitTargetWireSource()}
    return JSON.stringify(${invocation});
  })()`;
}

function admittedUnitTargetInput(input: Civ7UnitTargetInput): Civ7UnitTargetInput {
  try {
    const admitted = {
      unitId: assertCiv7ComponentId(input.unitId, "unitId"),
      x: input.x,
      y: input.y,
    };
    if (!Value.Check(Civ7UnitTargetInputSchema, admitted)) {
      throw new TypeError(
        "Unit target input requires a ComponentID and bounded integer coordinates."
      );
    }
    return admitted;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function admittedUnitTargetCheckInput(
  input: Civ7UnitTargetActionCheckInput
): Civ7UnitTargetActionCheckInput {
  try {
    const admitted = {
      ...admittedUnitTargetInput(input),
      actionId: input.actionId,
    };
    if (!Value.Check(Civ7UnitTargetActionCheckInputSchema, admitted)) {
      throw new TypeError("Unit target action check requires a closed native action identifier.");
    }
    return admitted;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function admittedUnitTargetObservationInput(
  input: Civ7UnitTargetObservationInput
): Civ7UnitTargetObservationInput {
  try {
    const trackedUnitIds = input.trackedUnitIds?.map((id, index) =>
      assertCiv7ComponentId(id, `trackedUnitIds[${index}]`)
    );
    const admitted = {
      ...admittedUnitTargetInput(input),
      ...(trackedUnitIds === undefined ? {} : { trackedUnitIds }),
    };
    if (!Value.Check(Civ7UnitTargetObservationInputSchema, admitted)) {
      throw new TypeError("Unit target observation contains invalid tracked unit identities.");
    }
    return admitted;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function admittedUnitTargetSendInput(
  input: Civ7UnitTargetActionSendInput
): Civ7UnitTargetActionSendInput {
  try {
    const admitted = {
      ...admittedUnitTargetCheckInput(input),
      expected: input.expected,
    };
    if (!Value.Check(Civ7UnitTargetActionSendInputSchema, admitted)) {
      throw new TypeError("Unit target action send requires the exact preceding action check.");
    }
    return admitted;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function unitTargetWireSource(): string {
  return `
    const jsonValue = (value) => {
      if (value === undefined) return null;
      const serialized = JSON.stringify(value);
      if (serialized === undefined) return null;
      return JSON.parse(serialized);
    };
    const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const source = value.id && typeof value.id === "object" ? value.id : value;
      if (!Number.isInteger(source.owner) || !Number.isInteger(source.id)) return null;
      const out = { owner: source.owner, id: source.id };
      if (Number.isInteger(source.type)) out.type = source.type;
      return out;
    };
    const locationOf = (value) => {
      const location = value && typeof value === "object" ? value.location : null;
      return location && Number.isInteger(location.x) && Number.isInteger(location.y)
        ? { x: location.x, y: location.y }
        : null;
    };
    const nullableNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
    const summarizeUnitValue = (value, fallbackId) => {
      if (!value || typeof value !== "object") return null;
      const id = toComponentId(value.id) ?? toComponentId(fallbackId);
      if (!id) return null;
      const damage = nullableNumber(value.Health?.damage);
      const maxDamage = nullableNumber(value.Health?.maxDamage);
      return {
        id,
        location: locationOf(value),
        movementMovesRemaining: nullableNumber(value.Movement?.movementMovesRemaining),
        movementTurnsRemaining: nullableNumber(value.Movement?.movementTurnsRemaining),
        attacksRemaining: nullableNumber(value.Combat?.attacksRemaining),
        damage,
        hitPoints: damage === null || maxDamage === null ? null : maxDamage - damage,
      };
    };
    const readUnit = (unitId) => {
      if (typeof Units?.get !== "function") throw new Error("Units.get is unavailable.");
      return summarizeUnitValue(Units.get(unitId), unitId);
    };
    const targetUnitIds = (x, y) => {
      if (typeof MapUnits?.getUnits !== "function") throw new Error("MapUnits.getUnits is unavailable.");
      const values = MapUnits.getUnits(x, y);
      if (!Array.isArray(values)) throw new Error("MapUnits.getUnits did not return an array.");
      return values.map((value) => {
        const id = toComponentId(value);
        if (!id) throw new Error("Target unit has no valid ComponentID.");
        return id;
      });
    };
    const readTrackedUnits = (ids) =>
      ids.map((id) => ({ id, unit: readUnit(id) }));
    const readTargetIndex = (x, y) => {
      if (typeof GameplayMap?.getIndexFromLocation === "function") {
        const value = GameplayMap.getIndexFromLocation({ x, y });
        return Number.isInteger(value) ? value : null;
      }
      if (typeof GameplayMap?.getIndexFromXY === "function") {
        const value = GameplayMap.getIndexFromXY(x, y);
        return Number.isInteger(value) ? value : null;
      }
      return null;
    };
    const readCombatType = (unitId, x, y, none) => {
      if (typeof Game?.Combat?.testAttackInto !== "function") return null;
      return jsonValue(Game.Combat.testAttackInto(unitId, { X: x, Y: y, Modifiers: none }));
    };
    const modifierValues = () => {
      const none = Number.isInteger(UnitOperationMoveModifiers?.NONE)
        ? UnitOperationMoveModifiers.NONE
        : null;
      const attack = Number.isInteger(UnitOperationMoveModifiers?.ATTACK)
        ? UnitOperationMoveModifiers.ATTACK
        : null;
      const ignore = Number.isInteger(UnitOperationMoveModifiers?.MOVE_IGNORE_UNEXPLORED_DESTINATION)
        ? UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION
        : null;
      return {
        none,
        dispatch: attack == null || ignore == null ? null : attack + ignore,
      };
    };
    const unobservedWar = () => ({
      observed: false,
      result: null,
      player2: null,
      noPlayerId: Number.isInteger(PlayerIds?.NO_PLAYER) ? PlayerIds.NO_PLAYER : null,
      required: null,
    });
    const observeWar = (input) => {
      if (typeof Players?.get !== "function") throw new Error("Players.get is unavailable.");
      const diplomacy = Players.get(input.unitId.owner)?.Diplomacy;
      if (diplomacy == null) {
        return {
          observed: true,
          result: null,
          player2: null,
          noPlayerId: Number.isInteger(PlayerIds?.NO_PLAYER) ? PlayerIds.NO_PLAYER : null,
          required: false,
        };
      }
      if (typeof diplomacy.willMoveStartWar !== "function") {
        throw new Error("Diplomacy.willMoveStartWar is unavailable.");
      }
      const raw = diplomacy.willMoveStartWar(input.unitId, { x: input.x, y: input.y });
      const success = !!raw && typeof raw === "object" && raw.Success === true;
      if (success && raw.Player2 !== undefined && !Number.isInteger(raw.Player2)) {
        throw new Error("Diplomacy.willMoveStartWar returned an invalid Player2.");
      }
      const player2 = success && raw.Player2 !== undefined ? raw.Player2 : null;
      const noPlayerId = Number.isInteger(PlayerIds?.NO_PLAYER) ? PlayerIds.NO_PLAYER : null;
      return {
        observed: true,
        result: jsonValue(raw),
        player2,
        noPlayerId,
        required: player2 !== null && (noPlayerId === null || player2 !== noPlayerId),
      };
    };
    const observeUnitTarget = (
      input,
      trackedIds,
      includeWar = true,
      includeCombat = true,
    ) => {
      const targetIds = targetUnitIds(input.x, input.y);
      const tracked = Array.isArray(trackedIds) ? trackedIds : targetIds;
      const modifiers = modifierValues();
      return {
        localPlayerId: Number.isInteger(GameContext?.localPlayerID) ? GameContext.localPlayerID : null,
        unitId: input.unitId,
        target: { x: input.x, y: input.y, index: readTargetIndex(input.x, input.y) },
        actor: readUnit(input.unitId),
        targetUnits: targetIds
          .map((id) => readUnit(id))
          .filter((unit) => unit !== null),
        trackedTargetUnits: readTrackedUnits(tracked),
        combatType: includeCombat
          ? readCombatType(input.unitId, input.x, input.y, modifiers.none)
          : null,
        rangedCombatType: jsonValue(CombatTypes?.COMBAT_RANGED),
        war: includeWar ? observeWar(input) : unobservedWar(),
        modifiers,
      };
    };
    const offCurrentTile = (snapshot) => {
      const location = snapshot.actor?.location;
      return !!location && (location.x !== snapshot.target.x || location.y !== snapshot.target.y);
    };
    const actionSpec = (input, snapshot) => {
      const none = snapshot.modifiers.none;
      const dispatch = snapshot.modifiers.dispatch;
      if (!Number.isInteger(none) || !Number.isInteger(dispatch)) {
        throw new Error("UnitOperationMoveModifiers are unavailable.");
      }
      const base = { X: input.x, Y: input.y, Modifiers: none };
      const dispatchArgs = { X: input.x, Y: input.y, Modifiers: dispatch };
      switch (input.actionId) {
        case "naval-attack":
          return { family: "operation", operationType: "UNITOPERATION_NAVAL_ATTACK", args: base, sendArgs: dispatchArgs, prerequisite: { kind: "none", satisfied: true }, warGate: "after-check" };
        case "air-attack":
          return { family: "operation", operationType: "UNITOPERATION_AIR_ATTACK", args: base, sendArgs: dispatchArgs, prerequisite: { kind: "none", satisfied: true }, warGate: "after-check" };
        case "ranged-attack":
          return {
            family: "operation",
            operationType: "UNITOPERATION_RANGE_ATTACK",
            args: base,
            sendArgs: dispatchArgs,
            prerequisite: {
              kind: "ranged-combat",
              satisfied: snapshot.combatType !== null && snapshot.rangedCombatType !== null &&
                Object.is(snapshot.combatType, snapshot.rangedCombatType),
            },
            warGate: "before-check",
          };
        case "army-overrun":
          return { family: "command", operationType: "UNITCOMMAND_ARMY_OVERRUN", args: base, sendArgs: base, prerequisite: { kind: "none", satisfied: true }, warGate: "none" };
        case "swap-units":
          return { family: "operation", operationType: "UNITOPERATION_SWAP_UNITS", args: base, sendArgs: base, prerequisite: { kind: "off-current-tile", satisfied: offCurrentTile(snapshot) }, warGate: "none" };
        case "move-to":
          if (UnitOperationTypes?.MOVE_TO === undefined) {
            throw new Error("UnitOperationTypes.MOVE_TO is unavailable.");
          }
          return {
            family: "operation",
            operationType: UnitOperationTypes.MOVE_TO,
            args: dispatchArgs,
            sendArgs: dispatchArgs,
            prerequisite: { kind: "off-current-tile", satisfied: offCurrentTile(snapshot) },
            warGate: "before-check",
          };
        default:
          throw new Error("Unsupported unit target action.");
      }
    };
    const routerFor = (family) => family === "command" ? Game?.UnitCommands : Game?.UnitOperations;
    const checkUnitTargetAction = (input) => {
      let snapshot = observeUnitTarget(input, undefined, false, false);
      if (input.actionId === "ranged-attack") {
        snapshot = {
          ...snapshot,
          combatType: readCombatType(
            input.unitId,
            input.x,
            input.y,
            snapshot.modifiers.none,
          ),
        };
      }
      const spec = actionSpec(input, snapshot);
      if (snapshot.actor === null) {
        return {
          actionId: input.actionId,
          valid: false,
          prerequisite: { ...spec.prerequisite, satisfied: false },
          args: spec.args,
          result: null,
          snapshot,
        };
      }
      if (!spec.prerequisite.satisfied) {
        return {
          actionId: input.actionId,
          valid: false,
          prerequisite: spec.prerequisite,
          args: spec.args,
          result: null,
          snapshot,
        };
      }
      if (spec.warGate === "before-check") {
        snapshot = { ...snapshot, war: observeWar(input) };
        if (snapshot.war.required === true) {
          return {
            actionId: input.actionId,
            valid: false,
            prerequisite: spec.prerequisite,
            args: spec.args,
            result: null,
            snapshot,
          };
        }
      }
      const router = routerFor(spec.family);
      if (typeof router?.canStart !== "function") throw new Error("Unit action canStart is unavailable.");
      const raw = router.canStart(input.unitId, spec.operationType, spec.args, false);
      const valid = !!raw && typeof raw === "object" && raw.Success === true;
      if (valid && spec.warGate === "after-check") {
        snapshot = { ...snapshot, war: observeWar(input) };
      }
      return {
        actionId: input.actionId,
        valid,
        prerequisite: spec.prerequisite,
        args: spec.args,
        result: jsonValue(raw),
        snapshot,
      };
    };
    const sendUnitTargetAction = (input) => {
      let sendInvoked = false;
      try {
        const fresh = checkUnitTargetAction(input);
        if (input.actionId !== input.expected.actionId || !sameJson(fresh, input.expected)) {
          throw new Error("Unit target evidence changed after service admission.");
        }
        if (!fresh.valid) {
          return {
            ok: true,
            value: {
              sent: false,
              actionId: input.actionId,
              validation: fresh,
              before: fresh.snapshot,
              after: fresh.snapshot,
            },
          };
        }
        if (fresh.snapshot.war.required === true) {
          throw new Error("Unit target action requires the dedicated war-confirmation workflow.");
        }
        const spec = actionSpec(input, fresh.snapshot);
        const router = routerFor(spec.family);
        if (typeof router?.sendRequest !== "function") throw new Error("Unit action sendRequest is unavailable.");
        sendInvoked = true;
        router.sendRequest(input.unitId, spec.operationType, spec.sendArgs);
        const trackedIds = fresh.snapshot.targetUnits.map((unit) => unit.id);
        return {
          ok: true,
          value: {
            sent: true,
            actionId: input.actionId,
            validation: fresh,
            before: fresh.snapshot,
            after: observeUnitTarget(input, trackedIds),
          },
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: String(error).slice(0, 512),
        };
      }
    };`;
}
