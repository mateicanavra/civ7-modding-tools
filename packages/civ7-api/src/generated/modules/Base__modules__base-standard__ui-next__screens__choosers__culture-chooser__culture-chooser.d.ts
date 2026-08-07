import { type AdvisorRecommendations } from "/base-standard/ui/tutorial/advisor-utilities.js";
import { type ChooserDepthInfo } from "/base-standard/ui-next/screens/choosers/helpers.js";
export interface CultureNode {
    id: ProgressionTreeNodeType;
    name: string;
    icon: string;
    turns: number;
    treeType: ProgressionTreeType;
    unlocksByDepth: ChooserDepthInfo[];
    recommendations: AdvisorRecommendations[];
    isLocked?: boolean;
    cost: number;
    progress: number;
    /** The current depth index being researched (0-based). */
    currentDepthIndex: number;
}
