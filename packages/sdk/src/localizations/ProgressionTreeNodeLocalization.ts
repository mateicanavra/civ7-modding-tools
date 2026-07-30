import { TClassProperties } from "../types";
import { BaseLocalization } from "./BaseLocalization";

export type TProgressionTreeNodeLocalization = TClassProperties<ProgressionTreeNodeLocalization>;
/** Supplies the localized display name for one progression-tree node. */
export class ProgressionTreeNodeLocalization extends BaseLocalization<TProgressionTreeNodeLocalization> {
  name = "";

  constructor(payload: Partial<TProgressionTreeNodeLocalization> = {}) {
    super();
    this.fill(payload);
  }
}
