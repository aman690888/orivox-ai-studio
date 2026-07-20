import { ModelCapabilities } from "./types";

export interface IModelRouter {
  /**
   * Routes a prompt to the optimal model based on capabilities and returns structured JSON.
   */
  routeToJSON<T>(prompt: string, capabilities: ModelCapabilities, signal: AbortSignal): Promise<T>;
}
