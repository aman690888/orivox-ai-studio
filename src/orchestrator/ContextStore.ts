import { WorkflowState } from "./WorkflowState";

export class ContextStore {
  private current: WorkflowState;

  constructor(initialState: WorkflowState) {
    this.current = initialState;
  }

  public getState(): WorkflowState {
    return this.current;
  }

  public setState(nextState: WorkflowState): void {
    this.current = nextState;
  }

  /**
   * Extract a specific slice for an agent so they don't get the entire payload.
   */
  public extractSlice(extractor: (state: WorkflowState) => any): any {
    return extractor(this.current);
  }
}
