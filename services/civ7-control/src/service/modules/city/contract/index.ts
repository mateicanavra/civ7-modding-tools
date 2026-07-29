import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { populationPlaceRequest } from "./population-place-request";
import { productionChoice } from "./production-choice";
import { townFocusRequest } from "./town-focus-request";

export const contract = {
  population: {
    place: {
      request: populationPlaceRequest,
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
      request: townFocusRequest.change,
    },
    review: {
      request: townFocusRequest.review,
    },
  },
};

export type Civ7CityPopulationPlacementInput = InferContractRouterInputs<
  typeof contract
>["population"]["place"]["request"];
export type Civ7CityProductionChoiceInput = InferContractRouterInputs<
  typeof contract
>["production"]["choice"]["check"];
export type Civ7CityTownFocusChangeInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["change"]["request"];
export type Civ7CityTownFocusReviewInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["review"]["request"];
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
export type Civ7CityTownFocusReviewResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["review"]["request"];
