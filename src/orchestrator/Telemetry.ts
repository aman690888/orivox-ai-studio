import { EventBus } from "./EventBus";
import { WorkflowBudget } from "./WorkflowBudget";
import { AssetCache } from "./AssetCache";

export interface TelemetryMetrics {
  workflow_duration_ms: number;
  agent_durations_ms: Record<string, number>;
  total_retries: number;
  api_latency_ms: number[];
  token_usage: number;
  cache_hit_ratio: number;
  validation_failures: number;
  regeneration_count: number;
  total_cost_usd: number;
  models_used: string[];
  success: boolean;
}

export class TelemetryTracker {
  private metrics: TelemetryMetrics = {
    workflow_duration_ms: 0,
    agent_durations_ms: {},
    total_retries: 0,
    api_latency_ms: [],
    token_usage: 0,
    cache_hit_ratio: 0,
    validation_failures: 0,
    regeneration_count: 0,
    total_cost_usd: 0,
    models_used: [],
    success: false,
  };

  private workflowStartTime: number = 0;

  constructor(private eventBus: EventBus) {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.eventBus.subscribe("WORKFLOW_STARTED", () => {
      this.workflowStartTime = Date.now();
    });

    this.eventBus.subscribe("WORKFLOW_COMPLETED", () => {
      this.metrics.workflow_duration_ms = Date.now() - this.workflowStartTime;
      this.metrics.success = true;
    });

    this.eventBus.subscribe("WORKFLOW_FAILED", () => {
      this.metrics.workflow_duration_ms = Date.now() - this.workflowStartTime;
      this.metrics.success = false;
    });

    this.eventBus.subscribe("AGENT_COMPLETED", (e) => {
      const { agent_id, duration_ms } = e.payload;
      this.metrics.agent_durations_ms[agent_id] = (this.metrics.agent_durations_ms[agent_id] || 0) + duration_ms;
    });

    this.eventBus.subscribe("AGENT_RETRY", () => {
      this.metrics.total_retries++;
    });

    this.eventBus.subscribe("API_CALL_COMPLETED", (e) => {
      const { latency_ms, tokens, cost, model } = e.payload;
      this.metrics.api_latency_ms.push(latency_ms);
      this.metrics.token_usage += tokens;
      this.metrics.total_cost_usd += cost;
      if (!this.metrics.models_used.includes(model)) {
        this.metrics.models_used.push(model);
      }
    });

    this.eventBus.subscribe("VALIDATION_FAILED", () => {
      this.metrics.validation_failures++;
    });

    this.eventBus.subscribe("SLIDE_REGENERATED", () => {
      this.metrics.regeneration_count++;
    });
  }

  public getMetrics(cache: AssetCache, budget: WorkflowBudget): TelemetryMetrics {
    const cacheStats = cache.getStats();
    const budgetStats = budget.getStats();
    
    this.metrics.cache_hit_ratio = cacheStats.hit_ratio;
    this.metrics.token_usage = budgetStats.real_tokens;
    this.metrics.total_cost_usd = budgetStats.total_cost_usd;

    return JSON.parse(JSON.stringify(this.metrics));
  }
}
