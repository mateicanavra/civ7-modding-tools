import { civ7ControlOrpcContractBase } from "./contract-base";
import {
  Civ7AttentionContract,
  type Civ7AttentionContract as Civ7AttentionContractType,
} from "./modules/attention/contract";
import {
  Civ7CityContract,
  type Civ7CityContract as Civ7CityContractType,
} from "./modules/city/contract";
import {
  Civ7DiplomacyContract,
  type Civ7DiplomacyContract as Civ7DiplomacyContractType,
} from "./modules/diplomacy/contract";
import {
  Civ7GovernmentContract,
  type Civ7GovernmentContract as Civ7GovernmentContractType,
} from "./modules/government/contract";
import {
  Civ7NarrativeContract,
  type Civ7NarrativeContract as Civ7NarrativeContractType,
} from "./modules/narrative/contract";
import {
  Civ7ProgressionContract,
  type Civ7ProgressionContract as Civ7ProgressionContractType,
} from "./modules/progression/contract";
import {
  Civ7ReadinessContract,
  type Civ7ReadinessContract as Civ7ReadinessContractType,
} from "./modules/readiness/contract";
import {
  Civ7NotificationsContract,
  type Civ7NotificationsContract as Civ7NotificationsContractType,
} from "./modules/notifications/contract";
import {
  Civ7StrategyContract,
  type Civ7StrategyContract as Civ7StrategyContractType,
} from "./modules/strategy/contract";
import {
  Civ7TurnContract,
  type Civ7TurnContract as Civ7TurnContractType,
} from "./modules/turn/contract";
import {
  Civ7UnitContract,
  type Civ7UnitContract as Civ7UnitContractType,
} from "./modules/unit/contract";
import {
  Civ7WorldContract,
  type Civ7WorldContract as Civ7WorldContractType,
} from "./modules/world/contract";

export type Civ7ControlOrpcContract = Readonly<{
  attention: Civ7AttentionContractType;
  city: Civ7CityContractType;
  diplomacy: Civ7DiplomacyContractType;
  government: Civ7GovernmentContractType;
  narrative: Civ7NarrativeContractType;
  notifications: Civ7NotificationsContractType;
  progression: Civ7ProgressionContractType;
  readiness: Civ7ReadinessContractType;
  strategy: Civ7StrategyContractType;
  turn: Civ7TurnContractType;
  unit: Civ7UnitContractType;
  world: Civ7WorldContractType;
}>;

export const Civ7ControlOrpcContract: Civ7ControlOrpcContract =
  civ7ControlOrpcContractBase.router({
    attention: Civ7AttentionContract,
    city: Civ7CityContract,
    diplomacy: Civ7DiplomacyContract,
    government: Civ7GovernmentContract,
    narrative: Civ7NarrativeContract,
    notifications: Civ7NotificationsContract,
    progression: Civ7ProgressionContract,
    readiness: Civ7ReadinessContract,
    strategy: Civ7StrategyContract,
    turn: Civ7TurnContract,
    unit: Civ7UnitContract,
    world: Civ7WorldContract,
  });
