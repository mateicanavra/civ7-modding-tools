import * as lodash from "lodash-es";
import { AdjacencyYieldChangeNode } from "./AdjacencyYieldChangeNode";
import { BaseNode } from "./BaseNode";
import { BuildingNode } from "./BuildingNode";
import { ChargedUnitAbilityNode } from "./ChargedUnitAbilityNode";
import { CityNameNode } from "./CityNameNode";
import { CivilizationItemNode } from "./CivilizationItemNode";
import { CivilizationNode } from "./CivilizationNode";
import { CivilizationTagNode } from "./CivilizationTagNode";
import { CivilizationTraitNode } from "./CivilizationTraitNode";
import { CivilizationUnlockNode } from "./CivilizationUnlockNode";
import { ConstructibleAdjacencyNode } from "./ConstructibleAdjacencyNode";
import { ConstructibleMaintenanceNode } from "./ConstructibleMaintenanceNode";
import { ConstructibleNode } from "./ConstructibleNode";
import { ConstructiblePlunderNode } from "./ConstructiblePlunderNode";
import { ConstructibleValidBiomeNode } from "./ConstructibleValidBiomeNode";
import { ConstructibleValidDistrictNode } from "./ConstructibleValidDistrictNode";
import { ConstructibleValidFeatureNode } from "./ConstructibleValidFeatureNode";
import { ConstructibleValidResourceNode } from "./ConstructibleValidResourceNode";
import { ConstructibleValidTerrainNode } from "./ConstructibleValidTerrainNode";
import { ConstructibleWarehouseYieldNode } from "./ConstructibleWarehouseYieldNode";
import { ConstructibleYieldChangeNode } from "./ConstructibleYieldChangeNode";
import { DistrictFreeConstructibleNode } from "./DistrictFreeConstructibleNode";
import { EnglishTextNode } from "./EnglishTextNode";
import { GameModifierNode } from "./GameModifierNode";
import { IconDefinitionNode } from "./IconDefinitionNode";
import { ImprovementNode } from "./ImprovementNode";
import { KindNode } from "./KindNode";
import { LeaderCivilizationBiasNode } from "./LeaderCivilizationBiasNode";
import { LeaderUnlockNode } from "./LeaderUnlockNode";
import { LegacyCivilizationNode } from "./LegacyCivilizationNode";
import { LegacyCivilizationTraitNode } from "./LegacyCivilizationTraitNode";
import { ProgressionTreeAdvisoryNode } from "./ProgressionTreeAdvisoryNode";
import { ProgressionTreeNode } from "./ProgressionTreeNode";
import { ProgressionTreeNodeNode } from "./ProgressionTreeNodeNode";
import { ProgressionTreeNodeUnlockNode } from "./ProgressionTreeNodeUnlockNode";
import { ProgressionTreePrereqNode } from "./ProgressionTreePrereqNode";
import { RequirementArgumentNode } from "./RequirementArgumentNode";
import { RequirementNode } from "./RequirementNode";
import { RequirementSetNode } from "./RequirementSetNode";
import { RequirementSetRequirementNode } from "./RequirementSetRequirementNode";
import { StartBiasAdjacentToCoastNode } from "./StartBiasAdjacentToCoastNode";
import { StartBiasBiomeNode } from "./StartBiasBiomeNode";
import { StartBiasFeatureClassNode } from "./StartBiasFeatureClassNode";
import { StartBiasResourceNode } from "./StartBiasResourceNode";
import { StartBiasRiverNode } from "./StartBiasRiverNode";
import { StartBiasTerrainNode } from "./StartBiasTerrainNode";
import { GameCivilizationNodeSlice } from "./slices/GameCivilizationNodeSlice";
import { ShellCivilizationNodeSlice } from "./slices/ShellCivilizationNodeSlice";
import { TagNode } from "./TagNode";
import { TraditionModifierNode } from "./TraditionModifierNode";
import { TraditionNode } from "./TraditionNode";
import { TraitModifierNode } from "./TraitModifierNode";
import { TraitNode } from "./TraitNode";
import { TypeNode } from "./TypeNode";
import { TypeTagNode } from "./TypeTagNode";
import { UniqueQuarterModifierNode } from "./UniqueQuarterModifierNode";
import { UniqueQuarterNode } from "./UniqueQuarterNode";
import { Unit_AbilityNode } from "./Unit_AbilityNode";
import { UnitAbilityModifierNode } from "./UnitAbilityModifierNode";
import { UnitAbilityNode } from "./UnitAbilityNode";
import { UnitAdvisoryNode } from "./UnitAdvisoryNode";
import { UnitCostNode } from "./UnitCostNode";
import { UnitNode } from "./UnitNode";
import { UnitReplaceNode } from "./UnitReplaceNode";
import { UnitStatNode } from "./UnitStatNode";
import { UnitUpgradeNode } from "./UnitUpgradeNode";
import { UnlockConfigurationValueNode } from "./UnlockConfigurationValueNode";
import { UnlockNode } from "./UnlockNode";
import { UnlockRequirementNode } from "./UnlockRequirementNode";
import { UnlockRewardNode } from "./UnlockRewardNode";
import { VisArtCivilizationBuildingCultureNode } from "./VisArtCivilizationBuildingCultureNode";
import { VisArtCivilizationUnitCultureNode } from "./VisArtCivilizationUnitCultureNode";
import { VisualRemapNode } from "./VisualRemapNode";
import { WarehouseYieldChangeNode } from "./WarehouseYieldChangeNode";

export type TDatabase = Pick<
  DatabaseNode,
  | "civilizationItems"
  | "civilizationTags"
  | "civilizationTraits"
  | "civilizations"
  | "constructibleMaintenances"
  | "constructibleValidDistricts"
  | "constructibleYieldChanges"
  | "constructibles"
  | "englishText"
  | "iconDefinitions"
  | "legacyCivilizationTraits"
  | "legacyCivilizations"
  | "civilizationUnlocks"
  | "tags"
  | "traitModifiers"
  | "traits"
  | "typeTags"
  | "kinds"
  | "types"
  | "unitCosts"
  | "buildings"
  | "unitReplaces"
  | "unitStats"
  | "units"
  | "unitUpgrades"
  | "unitAdvisories"
  | "unitAbilities"
  | "chargedUnitAbilities"
  | "unit_Abilities"
  | "unitAbilityModifiers"
  | "unlocks"
  | "unlockRequirements"
  | "unlockConfigurationValues"
  | "requirementSets"
  | "requirements"
  | "requirementArguments"
  | "requirementSetRequirements"
  | "unlockRewards"
  | "adjacencyYieldChanges"
  | "constructibleAdjacencies"
  | "warehouseYieldChanges"
  | "progressionTreeAdvisories"
  | "progressionTrees"
  | "progressionTreeNodes"
  | "progressionTreeNodeUnlocks"
  | "traditions"
  | "traditionModifiers"
  | "progressionTreePrereqs"
  | "constructibleWarehouseYields"
  | "districtFreeConstructibles"
  | "constructibleValidBiomes"
  | "constructibleValidFeatures"
  | "constructibleValidTerrains"
  | "constructibleValidResources"
  | "constructiblePlunders"
  | "improvements"
  | "startBiasBiomes"
  | "startBiasTerrains"
  | "startBiasRivers"
  | "startBiasResources"
  | "startBiasFeatureClasses"
  | "startBiasAdjacentToCoasts"
  | "visArtCivilizationBuildingCultures"
  | "visArtCivilizationUnitCultures"
  | "uniqueQuarters"
  | "uniqueQuarterModifiers"
  | "gameModifiers"
  | "cityNames"
  | "leaderUnlocks"
  | "leaderCivilizationBias"
  | "visualRemaps"
>;

export class DatabaseNode extends BaseNode<TDatabase> {
  _name = "Database";

  kinds: KindNode[] = [];
  types: TypeNode[] = [];
  tags: TagNode[] = [];
  typeTags: TypeTagNode[] = [];
  traits: TraitNode[] = [];
  traitModifiers: TraitModifierNode[] = [];

  civilizations: CivilizationNode[] | ShellCivilizationNodeSlice[] | GameCivilizationNodeSlice[] =
    [];
  civilizationItems: CivilizationItemNode[] = [];
  civilizationTags: CivilizationTagNode[] = [];
  civilizationTraits: CivilizationTraitNode[] = [];
  civilizationUnlocks: CivilizationUnlockNode[] = [];
  legacyCivilizationTraits: LegacyCivilizationTraitNode[] = [];
  legacyCivilizations: LegacyCivilizationNode[] = [];

  leaderUnlocks: LeaderUnlockNode[] = [];
  leaderCivilizationBias: LeaderCivilizationBiasNode[] = [];

  buildings: BuildingNode[] = [];
  improvements: ImprovementNode[] = [];
  constructibles: ConstructibleNode[] = [];
  constructibleMaintenances: ConstructibleMaintenanceNode[] = [];
  constructibleValidDistricts: ConstructibleValidDistrictNode[] = [];
  constructibleValidBiomes: ConstructibleValidBiomeNode[] = [];
  constructibleValidFeatures: ConstructibleValidFeatureNode[] = [];
  constructibleValidTerrains: ConstructibleValidTerrainNode[] = [];
  constructibleValidResources: ConstructibleValidResourceNode[] = [];
  constructibleYieldChanges: ConstructibleYieldChangeNode[] = [];
  adjacencyYieldChanges: AdjacencyYieldChangeNode[] = [];
  constructibleAdjacencies: ConstructibleAdjacencyNode[] = [];
  warehouseYieldChanges: WarehouseYieldChangeNode[] = [];
  constructibleWarehouseYields: ConstructibleWarehouseYieldNode[] = [];
  constructiblePlunders: ConstructiblePlunderNode[] = [];

  cityNames: CityNameNode[] = [];

  districtFreeConstructibles: DistrictFreeConstructibleNode[] = [];

  progressionTreeAdvisories: ProgressionTreeAdvisoryNode[] = [];
  progressionTrees: ProgressionTreeNode[] = [];
  progressionTreeNodes: ProgressionTreeNodeNode[] = [];
  progressionTreeNodeUnlocks: ProgressionTreeNodeUnlockNode[] = [];
  progressionTreePrereqs: ProgressionTreePrereqNode[] = [];

  traditions: TraditionNode[] = [];
  traditionModifiers: TraditionModifierNode[] = [];

  units: UnitNode[] = [];
  unitCosts: UnitCostNode[] = [];
  unitReplaces: UnitReplaceNode[] = [];
  unitUpgrades: UnitUpgradeNode[] = [];
  unitStats: UnitStatNode[] = [];
  unitAdvisories: UnitAdvisoryNode[] = [];

  // Unit ability properties
  unitAbilities: UnitAbilityNode[] = [];
  chargedUnitAbilities: ChargedUnitAbilityNode[] = [];
  unit_Abilities: Unit_AbilityNode[] = [];
  unitAbilityModifiers: UnitAbilityModifierNode[] = [];

  englishText: EnglishTextNode[] = [];
  iconDefinitions: IconDefinitionNode[] = [];
  visualRemaps: VisualRemapNode[] = [];

  uniqueQuarters: UniqueQuarterNode[] = [];
  uniqueQuarterModifiers: UniqueQuarterModifierNode[] = [];

  gameModifiers: GameModifierNode[] = [];

  unlocks: UnlockNode[] = [];
  unlockRewards: UnlockRewardNode[] = [];
  unlockRequirements: UnlockRequirementNode[] = [];
  unlockConfigurationValues: UnlockConfigurationValueNode[] = [];

  requirementSets: RequirementSetNode[] = [];
  requirements: RequirementNode[] = [];
  requirementArguments: RequirementArgumentNode[] = [];
  requirementSetRequirements: RequirementSetRequirementNode[] = [];

  startBiasBiomes: StartBiasBiomeNode[] = [];
  startBiasResources: StartBiasResourceNode[] = [];
  startBiasTerrains: StartBiasTerrainNode[] = [];
  startBiasRivers: StartBiasRiverNode[] = [];
  startBiasFeatureClasses: StartBiasFeatureClassNode[] = [];
  startBiasAdjacentToCoasts: StartBiasAdjacentToCoastNode[] = [];
  visArtCivilizationBuildingCultures: VisArtCivilizationBuildingCultureNode[] = [];
  visArtCivilizationUnitCultures: VisArtCivilizationUnitCultureNode[] = [];

  constructor(payload: Partial<TDatabase> = {}) {
    super();
    this.fill(payload);
  }

  toXmlElement() {
    //check if all nodes is empty
    if (
      Object.keys(this)
        .filter((key) => Array.isArray(this[key]))
        .every((key) => this[key].length === 0)
    ) {
      return null;
    }

    const except: string[] = [];
    const additionalMapping = {
      constructibleMaintenances: "Constructible_Maintenances",
      constructibleValidDistricts: "Constructible_ValidDistricts",
      constructibleValidBiomes: "Constructible_ValidBiomes",
      constructibleValidFeatures: "Constructible_ValidFeatures",
      constructibleValidTerrains: "Constructible_ValidTerrains",
      constructibleValidResources: "Constructible_ValidResources",
      constructibleYieldChanges: "Constructible_YieldChanges",
      constructibleAdjacencies: "Constructible_Adjacencies",
      constructiblePlunders: "Constructible_Plunders",
      districtFreeConstructibles: "District_FreeConstructibles",
      adjacencyYieldChanges: "Adjacency_YieldChanges",
      warehouseYieldChanges: "Warehouse_YieldChanges",
      constructibleWarehouseYields: "Constructible_WarehouseYields",
      progressionTreeAdvisories: "ProgressionTree_Advisories",
      visArtCivilizationBuildingCultures: "VisArt_CivilizationBuildingCultures",
      visArtCivilizationUnitCultures: "VisArt_CivilizationUnitCultures",
      unitCosts: "Unit_Costs",
      unitStats: "Unit_Stats",
      unitAdvisories: "Unit_Advisories",
      unitAbilities: "UnitAbilities",
      chargedUnitAbilities: "ChargedUnitAbilities",
      unit_Abilities: "Unit_Abilities",
      unitAbilityModifiers: "UnitAbilityModifiers",
    };
    const data = Object.keys(this)
      .filter((key) => !except.includes(key))
      .reduce((prev, current) => {
        if (Array.isArray(this[current])) {
          if (this[current].length === 0) {
            return prev;
          }

          let key = additionalMapping[current]
            ? additionalMapping[current]
            : lodash.startCase(current).replace(/ /g, "");

          return {
            ...prev,
            [key]: this[current].map((item) => item.toXmlElement()),
          };
        }
        return prev;
      }, {});
    return {
      Database: {
        ...data,
      },
    };
  }
}
