import { ExecutionGraph, GraphNode } from "./ExecutionGraph";
import { WorkflowState } from "./WorkflowState";
import { ContextStore } from "./ContextStore";
import { EventBus } from "./EventBus";
import { CheckpointManager } from "./CheckpointManager";
import { AgentExecutor } from "./AgentExecutor";
import { WorkflowConfig, ExecutionState } from "./types";
import { WorkflowBudget } from "./WorkflowBudget";
import { TelemetryTracker, TelemetryMetrics } from "./Telemetry";

export class AIWorkflowOrchestrator {
  private state: ExecutionState = "PENDING";
  private abortController: AbortController = new AbortController();
  
  private graph: ExecutionGraph;
  private eventBus: EventBus;
  private contextStore: ContextStore;
  private checkpointManager: CheckpointManager;
  private executor: AgentExecutor;
  private budget: WorkflowBudget;
  private telemetry: TelemetryTracker;

  constructor(
    private config: WorkflowConfig,
    initialState: WorkflowState,
    graph: ExecutionGraph,
    budget: WorkflowBudget
  ) {
    this.graph = graph;
    this.budget = budget;
    this.eventBus = new EventBus();
    this.contextStore = new ContextStore(initialState);
    this.checkpointManager = new CheckpointManager();
    this.executor = new AgentExecutor(this.eventBus, config.workflow_id);
    this.telemetry = new TelemetryTracker(this.eventBus);
  }

  public on(event: string, handler: (payload: any) => void): void {
    this.eventBus.subscribe(event, handler);
  }

  public cancel(): void {
    if (this.state === "RUNNING") {
      this.abortController.abort();
      this.state = "CANCELLED";
      this.eventBus.publish("WORKFLOW_CANCELLED", {}, this.config.workflow_id);
    }
  }

  public getTelemetry(): TelemetryMetrics {
    return this.telemetry.getMetrics(this.contextStore.getState().assetCache, this.budget);
  }

  public async run(): Promise<WorkflowState> {
    if (this.state !== "PENDING" && this.state !== "FAILED" && this.state !== "CLARIFICATION_REQUIRED") {
      throw new Error(`Cannot run workflow in state: ${this.state}`);
    }

    this.state = "RUNNING";
    this.eventBus.publish("WORKFLOW_STARTED", {}, this.config.workflow_id);

    try {
      const executionOrder = this.graph.sort();

      for (const nodeId of executionOrder) {
        if (this.abortController.signal.aborted) {
          throw new Error("Workflow cancelled via signal.");
        }

        const node = this.graph.getNode(nodeId);
        
        if (this.config.enable_checkpoints) {
          const cachedState = this.checkpointManager.getCheckpoint(nodeId);
          if (cachedState) {
            this.contextStore.setState(cachedState);
            this.eventBus.publish("CHECKPOINT_RESTORED", { node_id: nodeId }, this.config.workflow_id);
            continue;
          }
        }

        // The budget manager is conceptually hooked inside the ModelRouter to track tokens.
        // We ensure we haven't blown the total workflow budget before executing the next node.
        if (this.budget.getRemainingBudgetUsd() <= 0) {
          throw new Error("Workflow budget exhausted before execution completion.");
        }

        const currentState = this.contextStore.getState();
        const nextState = await this.executor.executeNode(node, currentState, this.abortController.signal);
        
        // Handle Clarification state explicitly
        const ephemeralOut = nextState.getEphemeral<any>("ClarificationRequest");
        if (ephemeralOut && ephemeralOut.clarificationRequired) {
          this.state = "CLARIFICATION_REQUIRED";
          this.eventBus.publish("CLARIFICATION_REQUESTED", ephemeralOut, this.config.workflow_id);
          this.contextStore.setState(nextState);
          return nextState; // Pause workflow execution
        }

        this.contextStore.setState(nextState);

        if (this.config.enable_checkpoints) {
          this.checkpointManager.saveCheckpoint(nodeId, nextState);
        }
      }

      this.state = "COMPLETED";
      this.eventBus.publish("WORKFLOW_COMPLETED", {}, this.config.workflow_id);
      return this.contextStore.getState();

    } catch (error: any) {
      if ((this.state as string) !== "CANCELLED") {
        this.state = "FAILED";
      }
      this.eventBus.publish("WORKFLOW_FAILED", { error: error.message }, this.config.workflow_id);
      throw error;
    }
  }
}
