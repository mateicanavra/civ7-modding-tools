import { ActionGroupBundle } from "../core/ActionGroupBundle";
import { ACTION_GROUP } from "./ACTION_GROUP";
import { AGE } from "./AGE";

/** Age-indexed loading bundles that keep shell, always, current-age, and existence criteria aligned. */
export const ACTION_GROUP_BUNDLE = {
  [AGE.ANTIQUITY]: new ActionGroupBundle({
    shell: ACTION_GROUP.SHELL,
    always: ACTION_GROUP.GAME,
    current: ACTION_GROUP.AGE_ANTIQUITY_CURRENT,
    exist: ACTION_GROUP.AGE_ANTIQUITY_EXIST,
  }),
  [AGE.EXPLORATION]: new ActionGroupBundle({
    shell: ACTION_GROUP.SHELL,
    always: ACTION_GROUP.GAME,
    current: ACTION_GROUP.AGE_EXPLORATION_CURRENT,
    exist: ACTION_GROUP.AGE_EXPLORATION_EXIST,
  }),
  [AGE.MODERN]: new ActionGroupBundle({
    shell: ACTION_GROUP.SHELL,
    always: ACTION_GROUP.GAME,
    current: ACTION_GROUP.AGE_MODERN_CURRENT,
    exist: ACTION_GROUP.AGE_MODERN_EXIST,
  }),
} as const;
