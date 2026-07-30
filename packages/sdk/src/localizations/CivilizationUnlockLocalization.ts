import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TCivilizationUnlockLocalization = TClassProperties<CivilizationUnlockLocalization>;
/** Supplies the description and tooltip shown for a civilization transition unlock. */
export class CivilizationUnlockLocalization extends BaseLocalization<TCivilizationUnlockLocalization> {
  description: string = "Play as [B]Something[/B].";
  tooltip: string = "Play as [B]Something[/B].";

  constructor(payload: Partial<TCivilizationUnlockLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
