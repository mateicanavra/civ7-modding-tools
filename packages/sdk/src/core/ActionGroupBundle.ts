import { ActionGroupNode } from "../nodes";
import { TClassProperties } from "../types";
import { fill } from "../utils";

type TActionGroupBundleActionGroupBundle = TClassProperties<ActionGroupBundle>;
/** Carries the canonical shell and game action groups used to route a builder's generated files. */
export class ActionGroupBundle {
  shell: ActionGroupNode = new ActionGroupNode();
  always: ActionGroupNode = new ActionGroupNode();
  current: ActionGroupNode = new ActionGroupNode();
  exist: ActionGroupNode = new ActionGroupNode();

  constructor(payload: Partial<TActionGroupBundleActionGroupBundle> = {}) {
    this.fill(payload);
  }

  fill = fill<TActionGroupBundleActionGroupBundle>;
}
