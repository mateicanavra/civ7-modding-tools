import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { populationPlacement } from "./population-placement";
import { productionChoice } from "./production-choice";
import { townFocus } from "./town-focus";

export const contract = {
  population: {
    place: {
      check: populationPlacement.check,
      request: populationPlacement.request,
    },
  },
  production: {
    choice: {
      check: productionChoice.check,
      request: productionChoice.request,
    },
  },
  townFocus: {
    change: {
      check: townFocus.change.check,
      request: townFocus.change.request,
    },
    review: {
      check: townFocus.review.check,
      request: townFocus.review.request,
    },
  },
};

export type Civ7CityPopulationPlacementInput = InferContractRouterInputs<
  typeof contract
>["population"]["place"]["check"];
export type Civ7CityProductionChoiceInput = InferContractRouterInputs<
  typeof contract
>["production"]["choice"]["check"];
export type Civ7CityTownFocusChangeInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["change"]["check"];
export type Civ7CityTownFocusReviewInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["review"]["check"];
export type Civ7CityPopulationPlacementCheckResult = InferContractRouterOutputs<
  typeof contract
>["population"]["place"]["check"];
export type Civ7CityPopulationPlacementResult = InferContractRouterOutputs<
  typeof contract
>["population"]["place"]["request"];
export type Civ7CityProductionChoiceCheckResult = InferContractRouterOutputs<
  typeof contract
>["production"]["choice"]["check"];
export type Civ7CityProductionChoiceResult = InferContractRouterOutputs<
  typeof contract
>["production"]["choice"]["request"];
export type Civ7CityTownFocusChangeResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["change"]["request"];
export type Civ7CityTownFocusChangeCheckResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["change"]["check"];
export type Civ7CityTownFocusReviewResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["review"]["request"];
export type Civ7CityTownFocusReviewCheckResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["review"]["check"];
