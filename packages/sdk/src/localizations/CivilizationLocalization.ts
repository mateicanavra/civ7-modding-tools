import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TCivilizationLocalization = TClassProperties<CivilizationLocalization>;
export class CivilizationLocalization extends BaseLocalization<TCivilizationLocalization> {
  name = "test";
  description = "text";
  fullName = "text";
  adjective = "text";
  abilityName: string = "text";
  abilityDescription: string = "text";
  unlockPlayAs: string = "Play as [B]Something[/B].";
  cityNames: string[] = ["test city name"];

  constructor(payload: Partial<TCivilizationLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
