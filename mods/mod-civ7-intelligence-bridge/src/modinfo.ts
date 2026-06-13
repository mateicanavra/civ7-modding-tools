export const CIV7_INTELLIGENCE_BRIDGE_MOD_ID = "civ7-intelligence-bridge";
export const CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT = "ui/civ7-intelligence-bridge.js";

export function renderCiv7IntelligenceBridgeModinfo(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${CIV7_INTELLIGENCE_BRIDGE_MOD_ID}" version="1" xmlns="ModInfo">
\t<Properties>
\t\t<Name>Civ7 Intelligence Bridge</Name>
\t\t<Description>Installs the game-scoped Civ7IntelligenceBridge serialized ingress for native control-oRPC.</Description>
\t\t<Authors>Matei Canavra</Authors>
\t\t<Package>Mod</Package>
\t</Properties>
\t<Dependencies>
\t\t<Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/>
\t</Dependencies>
\t<ActionCriteria>
\t\t<Criteria id="always">
\t\t\t<AlwaysMet></AlwaysMet>
\t\t</Criteria>
\t</ActionCriteria>
\t<ActionGroups>
\t\t<ActionGroup id="game-civ7-intelligence-bridge" scope="game" criteria="always">
\t\t\t<Actions>
\t\t\t\t<UIScripts>
\t\t\t\t\t<Item>${CIV7_INTELLIGENCE_BRIDGE_UI_SCRIPT}</Item>
\t\t\t\t</UIScripts>
\t\t\t</Actions>
\t\t</ActionGroup>
\t</ActionGroups>
</Mod>
`;
}
