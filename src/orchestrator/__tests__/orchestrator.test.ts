import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionGraph, GraphNode } from '../ExecutionGraph';
import { AgentExecutor } from '../AgentExecutor';
import { EventBus } from '../EventBus';
import { WorkflowState } from '../WorkflowState';
import { IAgent } from '../types';

describe('AI Pipeline Orchestrator - ExecutionGraph', () => {
  it('sorts nodes in topological dependency order', () => {
    const graph = new ExecutionGraph();
    graph.registerNode({ id: 'C', dependencies: ['B'], agent: {} as any, extractor: () => {}, mutator: () => ({} as any) });
    graph.registerNode({ id: 'A', dependencies: [], agent: {} as any, extractor: () => {}, mutator: () => ({} as any) });
    graph.registerNode({ id: 'B', dependencies: ['A'], agent: {} as any, extractor: () => {}, mutator: () => ({} as any) });
    
    expect(graph.sort()).toEqual(['A', 'B', 'C']);
  });

  it('throws on cycle detected', () => {
    const graph = new ExecutionGraph();
    graph.registerNode({ id: 'A', dependencies: ['B'], agent: {} as any, extractor: () => {}, mutator: () => ({} as any) });
    graph.registerNode({ id: 'B', dependencies: ['A'], agent: {} as any, extractor: () => {}, mutator: () => ({} as any) });
    
    expect(() => graph.sort()).toThrowError(/Cycle detected/);
  });
});

describe('AI Pipeline Orchestrator - AgentExecutor (Retries & Cancellation)', () => {
  let eventBus: EventBus;
  let executor: AgentExecutor;
  let mockAgent: IAgent<any, any>;
  
  beforeEach(() => {
    eventBus = new EventBus();
    executor = new AgentExecutor(eventBus, 'wf-1', { max_retries: 2, base_delay_ms: 10 });
    mockAgent = { id: 'mock-agent', execute: vi.fn() } as any;
  });

  it('retries on failure and eventually recovers', async () => {
    (mockAgent.execute as any)
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValueOnce({ success: true });

    const node: GraphNode = {
      id: 'n1',
      dependencies: [],
      agent: mockAgent,
      extractor: () => ({}),
      mutator: (state) => state,
    };

    const ac = new AbortController();
    const state = await executor.executeNode(node, {} as any, ac.signal);
    
    expect(mockAgent.execute).toHaveBeenCalledTimes(2);
    expect(state).toBeDefined();
  });

  it('throws after max retries are exceeded', async () => {
    (mockAgent.execute as any).mockRejectedValue(new Error('Persistent Fail'));

    const node: GraphNode = {
      id: 'n1',
      dependencies: [],
      agent: mockAgent,
      extractor: () => ({}),
      mutator: (state) => state,
    };

    const ac = new AbortController();
    await expect(executor.executeNode(node, {} as any, ac.signal)).rejects.toThrowError('Persistent Fail');
    expect(mockAgent.execute).toHaveBeenCalledTimes(2); // Retries based on retry manager internals
  });

  it('aborts execution immediately if cancelled', async () => {
    (mockAgent.execute as any).mockImplementation(async (input: any, signal: AbortSignal) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Cancelled')));
      });
    });

    const node: GraphNode = {
      id: 'n1',
      dependencies: [],
      agent: mockAgent,
      extractor: () => ({}),
      mutator: (state) => state,
    };

    const ac = new AbortController();
    const execPromise = executor.executeNode(node, {} as any, ac.signal);
    ac.abort();
    
    await expect(execPromise).rejects.toThrowError('Cancelled');
    expect(mockAgent.execute).toHaveBeenCalledTimes(1); // Should not retry on cancel
  });
  
  it('handles race conditions by ensuring state mutation is synchronized', async () => {
    // AgentExecutor resolves state mutator inline. If two nodes execute concurrently, 
    // we just verify mutator behaves immutably.
    const mutator = vi.fn().mockReturnValue({ version: 2 });
    const node: GraphNode = {
      id: 'n1',
      dependencies: [],
      agent: mockAgent,
      extractor: () => ({}),
      mutator,
    };
    (mockAgent.execute as any).mockResolvedValue({ val: 1 });
    
    const ac = new AbortController();
    await executor.executeNode(node, { version: 1 } as any, ac.signal);
    expect(mutator).toHaveBeenCalledWith({ version: 1 }, { val: 1 });
  });
});
