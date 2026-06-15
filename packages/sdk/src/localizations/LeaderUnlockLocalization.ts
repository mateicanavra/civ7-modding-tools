import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TLeaderUnlockLocalization = TClassProperties<LeaderUnlockLocalization>;
export class LeaderUnlockLocalization extends BaseLocalization<TLeaderUnlockLocalization> {
  tooltip: string = "[B]Benjamin Franklin[/B] was a statesman in [B]America[/B].";

  constructor(payload: Partial<TLeaderUnlockLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
