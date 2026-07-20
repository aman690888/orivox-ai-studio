export interface BudgetLimits {
  max_tokens: number;
  max_cost_usd: number;
  per_agent_cost_usd: Record<string, number>;
}

export class WorkflowBudget {
  private estimated_tokens: number = 0;
  private real_tokens: number = 0;
  private total_cost_usd: number = 0;
  private agent_costs: Record<string, number> = {};

  constructor(private limits: BudgetLimits) {}

  public recordUsage(agentId: string, tokens: number, costUsd: number): void {
    this.real_tokens += tokens;
    this.total_cost_usd += costUsd;
    this.agent_costs[agentId] = (this.agent_costs[agentId] || 0) + costUsd;

    if (this.total_cost_usd > this.limits.max_cost_usd) {
      throw new Error(`[BudgetManager] Max cost exceeded! Limit: $${this.limits.max_cost_usd}, Used: $${this.total_cost_usd}`);
    }
    
    if (this.limits.per_agent_cost_usd[agentId]) {
      if (this.agent_costs[agentId] > this.limits.per_agent_cost_usd[agentId]) {
        throw new Error(`[BudgetManager] Agent '${agentId}' exceeded budget of $${this.limits.per_agent_cost_usd[agentId]}`);
      }
    }
  }

  public getRemainingBudgetUsd(): number {
    return Math.max(0, this.limits.max_cost_usd - this.total_cost_usd);
  }

  public addEstimate(estimatedTokens: number): void {
    this.estimated_tokens += estimatedTokens;
  }

  public getStats() {
    return {
      estimated_tokens: this.estimated_tokens,
      real_tokens: this.real_tokens,
      total_cost_usd: this.total_cost_usd,
      remaining_budget: this.getRemainingBudgetUsd(),
      agent_costs: this.agent_costs,
    };
  }
}
