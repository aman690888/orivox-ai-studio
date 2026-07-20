import { WorkflowState } from "./WorkflowState";
import { IAgent } from "./types";

export interface GraphNode {
  id: string;
  agent: IAgent<any, any>;
  dependencies: string[];
  extractor: (state: WorkflowState) => any;
  mutator: (state: WorkflowState, output: any) => WorkflowState;
}

export class ExecutionGraph {
  private nodes: Map<string, GraphNode> = new Map();

  public registerNode(node: GraphNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`[ExecutionGraph] Node ${node.id} already exists.`);
    }
    this.nodes.set(node.id, node);
  }

  public getNode(id: string): GraphNode {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`[ExecutionGraph] Node ${id} not found.`);
    }
    return node;
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Returns a topologically sorted array of node IDs.
   * Simple Kahn's algorithm for DAG sorting.
   */
  public sort(): string[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    this.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      graph.set(node.id, []);
    });

    this.nodes.forEach((node) => {
      node.dependencies.forEach((dep) => {
        if (!this.nodes.has(dep)) throw new Error(`Missing dependency: ${dep}`);
        graph.get(dep)!.push(node.id);
        inDegree.set(node.id, inDegree.get(node.id)! + 1);
      });
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    const sorted: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(u);
      graph.get(u)!.forEach((v) => {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      });
    }

    if (sorted.length !== this.nodes.size) {
      throw new Error("[ExecutionGraph] Cycle detected in DAG.");
    }

    return sorted;
  }
}
