import { agentStopRouter } from "./agent-stop.router.js";
import { preCommitRouter } from "./pre-commit.router.js";
import { prePushRouter } from "./pre-push.router.js";

export const hookRouter = {
  agentStop: agentStopRouter,
  preCommit: preCommitRouter,
  prePush: prePushRouter,
};

export const router = hookRouter;
