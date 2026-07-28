import * as lodash from "lodash-es";

/** Produces the normalized `LOC_` key shared by localization records and their database references. */
export const locale = (prefix: string | null | undefined, variable: string): string => {
  return `LOC_${prefix || ""}_${lodash.snakeCase(variable).toLocaleUpperCase()}`;
};
