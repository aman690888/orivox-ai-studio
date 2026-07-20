import { WorkflowState } from "./WorkflowState";

export class CheckpointManager {
  private checkpoints: Map<string, WorkflowState> = new Map();

  public saveCheckpoint(nodeId: string, state: WorkflowState): void {
    // Save to persistence layer in real app (e.g., Redis)
    this.checkpoints.set(nodeId, state);
  }

  public getCheckpoint(nodeId: string): WorkflowState | undefined {
    return this.checkpoints.get(nodeId);
  }

  public clear(): void {
    this.checkpoints.clear();
  }
}
