import { attribute } from "./attribute";
import { choice } from "./choice";
import { dashboardCurrent } from "./dashboard-current";
import { target } from "./target";
import { tradition } from "./tradition";
import { traditionsCurrent } from "./traditions-current";
export const router = {
  dashboard: {
    current: dashboardCurrent,
  },
  traditions: {
    current: traditionsCurrent,
  },
  technology: {
    choice: choice.technology,
    target: target.technology,
  },
  culture: {
    choice: choice.culture,
    target: target.culture,
  },
  attribute,
  tradition,
};
