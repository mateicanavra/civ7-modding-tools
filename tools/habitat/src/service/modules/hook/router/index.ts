import { agentStopRouter } from "./agent-stop.router.js";
import { preCommitRouter } from "./pre-commit.router.js";
import { prePushRouter } from "./pre-push.router.js";

export const router = {
  agentStop: agentStopRouter,
  preCommit: preCommitRouter,
  prePush: prePushRouter,
};
