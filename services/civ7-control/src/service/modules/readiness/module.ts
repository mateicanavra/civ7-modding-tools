import { type ServiceModule, service } from "../../impl";

export const module: ServiceModule<"readiness"> = service.readiness;
