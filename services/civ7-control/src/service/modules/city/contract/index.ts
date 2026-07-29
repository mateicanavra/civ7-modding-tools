import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import { populationPlaceRequest } from "./population-place-request";
import { productionChoiceRequest } from "./production-choice-request";
import { townFocusRequest } from "./town-focus-request";

export const contract = {
  population: {
    place: {
      request: populationPlaceRequest,
    },
  },
  production: {
    choice: {
      request: productionChoiceRequest,
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
export type Civ7CityTownFocusChangeInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["change"]["request"];
export type Civ7CityTownFocusReviewInput = InferContractRouterInputs<
  typeof contract
>["townFocus"]["review"]["request"];
export type Civ7CityPopulationPlacementResult = InferContractRouterOutputs<
  typeof contract
>["population"]["place"]["request"];
export type Civ7CityProductionChoiceResult = InferContractRouterOutputs<
  typeof contract
>["production"]["choice"]["request"];
export type Civ7CityTownFocusChangeResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["change"]["request"];
export type Civ7CityTownFocusReviewResult = InferContractRouterOutputs<
  typeof contract
>["townFocus"]["review"]["request"];
