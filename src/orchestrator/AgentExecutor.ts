import { GraphNode } from "./ExecutionGraph";
import { WorkflowState } from "./WorkflowState";
import { RetryManager } from "./RetryManager";
import { EventBus } from "./EventBus";
import { RetryPolicy } from "./types";

export class AgentExecutor {
  constructor(
    private eventBus: EventBus,
    private workflowId: string,
    private defaultRetryPolicy: RetryPolicy = { max_retries: 3, base_delay_ms: 1000 }
  ) {}

  public async executeNode(
    node: GraphNode,
    currentState: WorkflowState,
    signal: AbortSignal
  ): Promise<WorkflowState> {
    
    this.eventBus.publish("AGENT_STARTED", { agent_id: node.agent.id }, this.workflowId);

    const startTime = Date.now();
    const agentInput = node.extractor(currentState);

    try {
      const result = await RetryManager.withRetry(
        async () => {
          if (signal.aborted) throw new Error("Cancelled");
          const res = await node.agent.execute(agentInput, signal);
          if (res && (res as any).clarificationRequired) {
            throw new Error(`Agent ${node.agent.id} requested clarification. In automated mode, treating as failure to retry.`);
          }
          return res;
        },
        this.defaultRetryPolicy,
        (err, attempt) => {
          this.eventBus.publish("AGENT_RETRY", { agent_id: node.agent.id, attempt, error: err.toString() }, this.workflowId);
        }
      );

      const nextState = node.mutator(currentState, result);

      this.eventBus.publish("AGENT_COMPLETED", { 
        agent_id: node.agent.id, 
        duration_ms: Date.now() - startTime 
      }, this.workflowId);

      return nextState;

    } catch (error: any) {
      this.eventBus.publish("AGENT_FAILED", { 
        agent_id: node.agent.id, 
        error: error.message 
      }, this.workflowId);
      throw error;
    }
  }
}
