import { RetryPolicy } from "./types";

export class RetryManager {
  public static async withRetry<T>(
    operation: () => Promise<T>,
    policy: RetryPolicy,
    onRetry?: (error: any, attempt: number) => void
  ): Promise<T> {
    let attempt = 0;
    while (attempt < policy.max_retries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= policy.max_retries) {
          throw new Error(`[RetryManager] Exhausted ${policy.max_retries} retries. Final error: ${error}`);
        }
        if (onRetry) {
          onRetry(error, attempt);
        }
        const delay = policy.base_delay_ms * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Unreachable");
  }
}
