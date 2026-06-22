import { ORPCTaggedError } from "effect-orpc";

export class GraphServiceBadRequestError extends ORPCTaggedError("GraphServiceBadRequestError", {
  code: "BAD_REQUEST",
  status: 400,
}) {}

export class GraphServiceInternalError extends ORPCTaggedError("GraphServiceInternalError", {
  code: "INTERNAL_SERVER_ERROR",
  status: 500,
}) {}
