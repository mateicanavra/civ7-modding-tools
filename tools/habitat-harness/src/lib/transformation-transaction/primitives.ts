import { Type } from "typebox";

export const NonEmptyStringSchema = Type.String({ minLength: 1 });
