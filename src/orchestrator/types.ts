import { PresentationIR, UUID } from "@/types/presentation-ir.types";
import { ValidationReport } from "@/validation/types";

export type ExecutionState = "PENDING" | "RUNNING" | "VALIDATING" | "FAILED" | "COMPLETED" | "CANCELLED" | "CLARIFICATION_REQUIRED";

export interface ModelCapabilities {
  needs_reasoning?: boolean;
  needs_json_mode?: boolean;
  min_context_window?: number;
}

export interface IAgent<TInput, TOutput> {
  id: string;
  model_requirements: ModelCapabilities;
  execute(context: TInput, signal: AbortSignal): Promise<TOutput>;
}

export interface TelemetryEvent {
  event: string;
  timestamp: number;
  workflow_id: string;
  payload?: any;
}

export interface WorkflowConfig {
  workflow_id: string;
  max_cost_threshold?: number;
  enable_telemetry?: boolean;
  enable_checkpoints?: boolean;
}

export interface RetryPolicy {
  max_retries: number;
  base_delay_ms: number;
}
