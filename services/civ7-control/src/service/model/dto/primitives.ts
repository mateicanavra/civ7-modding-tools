import { type Static, Type } from "typebox";

export const Civ7ControlOrpcComponentIdSchema = Type.Object(
  {
    owner: Type.Number({ description: "Player slot that owns the Civ7 component." }),
    id: Type.Number({ description: "Engine identity of the Civ7 component." }),
    type: Type.Optional(
      Type.Number({ description: "Optional engine component-type discriminator." })
    ),
  },
  { additionalProperties: false, description: "Stable Civ7 component identity." }
);
export type Civ7ControlOrpcComponentId = Static<typeof Civ7ControlOrpcComponentIdSchema>;

export const Civ7ControlOrpcMapLocationSchema = Type.Object(
  {
    x: Type.Integer({
      minimum: 0,
      maximum: 1_000_000,
      description: "Zero-based Civ7 map column.",
    }),
    y: Type.Integer({
      minimum: 0,
      maximum: 1_000_000,
      description: "Zero-based Civ7 map row.",
    }),
  },
  { additionalProperties: false, description: "Civ7 map-grid location." }
);
export type Civ7ControlOrpcMapLocation = Readonly<Static<typeof Civ7ControlOrpcMapLocationSchema>>;
