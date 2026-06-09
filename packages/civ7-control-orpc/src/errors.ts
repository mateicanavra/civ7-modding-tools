import {
  ORPCTaggedError,
  type EffectErrorMap,
  type EffectErrorMapToErrorMap,
} from "effect-orpc";
import { Type, type Static } from "typebox";

import { toStandardSchema } from "./typebox-standard-schema";

export const Civ7DirectControlUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("runtime.playable.status"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7DirectControlUnavailableErrorData = Static<
  typeof Civ7DirectControlUnavailableErrorDataSchema
>;

export class Civ7DirectControlUnavailableError extends ORPCTaggedError(
  "Civ7DirectControlUnavailableError",
  {
    code: "DIRECT_CONTROL_UNAVAILABLE",
    message: "Direct-control playable status failed.",
    schema: toStandardSchema(Civ7DirectControlUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7CitySummaryUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.summary.read"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7CitySummaryUnavailableErrorData = Static<
  typeof Civ7CitySummaryUnavailableErrorDataSchema
>;

export class Civ7CitySummaryUnavailableError extends ORPCTaggedError(
  "Civ7CitySummaryUnavailableError",
  {
    code: "CITY_SUMMARY_UNAVAILABLE",
    message: "Direct-control city summary failed.",
    schema: toStandardSchema(Civ7CitySummaryUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7ReadyCityViewUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("city.ready.view"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7ReadyCityViewUnavailableErrorData = Static<
  typeof Civ7ReadyCityViewUnavailableErrorDataSchema
>;

export class Civ7ReadyCityViewUnavailableError extends ORPCTaggedError(
  "Civ7ReadyCityViewUnavailableError",
  {
    code: "READY_CITY_VIEW_UNAVAILABLE",
    message: "Direct-control ready-city view failed.",
    schema: toStandardSchema(Civ7ReadyCityViewUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7MapSummaryUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("map.summary.read"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7MapSummaryUnavailableErrorData = Static<
  typeof Civ7MapSummaryUnavailableErrorDataSchema
>;

export class Civ7MapSummaryUnavailableError extends ORPCTaggedError(
  "Civ7MapSummaryUnavailableError",
  {
    code: "MAP_SUMMARY_UNAVAILABLE",
    message: "Direct-control map summary failed.",
    schema: toStandardSchema(Civ7MapSummaryUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7PlayerSummaryUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("player.summary.read"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7PlayerSummaryUnavailableErrorData = Static<
  typeof Civ7PlayerSummaryUnavailableErrorDataSchema
>;

export class Civ7PlayerSummaryUnavailableError extends ORPCTaggedError(
  "Civ7PlayerSummaryUnavailableError",
  {
    code: "PLAYER_SUMMARY_UNAVAILABLE",
    message: "Direct-control player summary failed.",
    schema: toStandardSchema(Civ7PlayerSummaryUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7NotificationViewUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("notifications.view"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7NotificationViewUnavailableErrorData = Static<
  typeof Civ7NotificationViewUnavailableErrorDataSchema
>;

export class Civ7NotificationViewUnavailableError extends ORPCTaggedError(
  "Civ7NotificationViewUnavailableError",
  {
    code: "NOTIFICATION_VIEW_UNAVAILABLE",
    message: "Direct-control notification view failed.",
    schema: toStandardSchema(Civ7NotificationViewUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7ReadyUnitViewUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.ready.view"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7ReadyUnitViewUnavailableErrorData = Static<
  typeof Civ7ReadyUnitViewUnavailableErrorDataSchema
>;

export class Civ7ReadyUnitViewUnavailableError extends ORPCTaggedError(
  "Civ7ReadyUnitViewUnavailableError",
  {
    code: "READY_UNIT_VIEW_UNAVAILABLE",
    message: "Direct-control ready-unit view failed.",
    schema: toStandardSchema(Civ7ReadyUnitViewUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const Civ7UnitSummaryUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("unit.summary.read"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7UnitSummaryUnavailableErrorData = Static<
  typeof Civ7UnitSummaryUnavailableErrorDataSchema
>;

export class Civ7UnitSummaryUnavailableError extends ORPCTaggedError(
  "Civ7UnitSummaryUnavailableError",
  {
    code: "UNIT_SUMMARY_UNAVAILABLE",
    message: "Direct-control unit summary failed.",
    schema: toStandardSchema(Civ7UnitSummaryUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const civ7ControlOrpcErrorMap = {
  CITY_SUMMARY_UNAVAILABLE: Civ7CitySummaryUnavailableError,
  DIRECT_CONTROL_UNAVAILABLE: Civ7DirectControlUnavailableError,
  MAP_SUMMARY_UNAVAILABLE: Civ7MapSummaryUnavailableError,
  PLAYER_SUMMARY_UNAVAILABLE: Civ7PlayerSummaryUnavailableError,
  NOTIFICATION_VIEW_UNAVAILABLE: Civ7NotificationViewUnavailableError,
  READY_CITY_VIEW_UNAVAILABLE: Civ7ReadyCityViewUnavailableError,
  READY_UNIT_VIEW_UNAVAILABLE: Civ7ReadyUnitViewUnavailableError,
  UNIT_SUMMARY_UNAVAILABLE: Civ7UnitSummaryUnavailableError,
} satisfies EffectErrorMap;

export type Civ7ControlOrpcEffectErrorMap = typeof civ7ControlOrpcErrorMap;
export type Civ7ControlOrpcErrorMap =
  EffectErrorMapToErrorMap<Civ7ControlOrpcEffectErrorMap>;
