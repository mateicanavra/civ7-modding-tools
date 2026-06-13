import { type Static, Type } from "typebox";

export const Civ7ControlOrpcComponentIdSchema = Type.Object(
  {
    owner: Type.Number(),
    id: Type.Number(),
    type: Type.Optional(Type.Number()),
  },
  { additionalProperties: false }
);
export type Civ7ControlOrpcComponentId = Static<typeof Civ7ControlOrpcComponentIdSchema>;

export const Civ7ControlOrpcMapLocationSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  },
  { additionalProperties: false }
);
export type Civ7ControlOrpcMapLocation = Readonly<Static<typeof Civ7ControlOrpcMapLocationSchema>>;
