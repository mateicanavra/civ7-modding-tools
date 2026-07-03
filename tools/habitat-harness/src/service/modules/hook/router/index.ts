import { preCommitRouter } from "./pre-commit.router.js";
import { prePushRouter } from "./pre-push.router.js";

export const hookRouter = {
  preCommit: preCommitRouter,
  prePush: prePushRouter,
};

export const router = hookRouter;
