# Orivox V3 - AI Workflow Orchestrator Architecture

This document defines the runtime operating system for the Orivox AI pipeline. The Orchestrator manages the execution, resiliency, observability, and state of every AI agent defined in the AI Generation Pipeline.

---

## 1. CORE RESPONSIBILITIES
- **Execution Order & Dependency Graph**: Ensures agents run in the correct sequence (e.g., `LayoutPlanner` cannot run before `NarrativeAgent`).
- **Resiliency**: Handles timeouts, localized failures, and retries with backoff.
- **Resource Management**: Tracks token budgeting and computes costs in real-time.
- **Model Routing Abstraction**: Standardizes communication with OpenAI, Anthropic, Google, or local models.
- **Parallelization**: Manages concurrency across non-dependent nodes (e.g., concurrent generation of Slide 1 and Slide 2).

---

## 2. THE WORKFLOW LIFECYCLE

The Orchestrator executes a DAG (Directed Acyclic Graph) of operations.

### Execution States
Every step in the workflow graph maintains an execution state:
- `PENDING`: Waiting for upstream dependencies.
- `RUNNING`: Actively waiting on inference.
- `VALIDATING`: Output returned, passing through schema checks.
- `FAILED`: Hard error or max retries exhausted.
- `COMPLETED`: Data written to shared memory.
- `CANCELLED`: Execution aborted by user or timeout.

### State Management & Shared Memory
Agents do not pass data directly to each other. The Orchestrator maintains a centralized `WorkflowState` object (a mutable wrapper around the `PresentationIR`).
- **Context Propagation**: Before an agent executes, the Orchestrator extracts exactly the subset of `WorkflowState` the agent needs.
- **Isolation**: Agents receive read-only slices. They return a structured output payload. The Orchestrator validates the payload, then mutates the `WorkflowState`.

---

## 3. AGENT RUNTIME INTERFACE

Every AI Agent implements a standardized `IAgent` interface conceptually:
```typescript
interface IAgent<TInput, TOutput> {
  id: string;
  model_requirements: ModelCapabilities;
  execute(context: TInput, signals: AbortSignal): Promise<TOutput>;
}
```

### Model Routing Abstraction
Agents do not call APIs directly. They request capabilities (e.g., `"needs_reasoning": true`, `"needs_json_mode": true`).
The Orchestrator's **Model Router** resolves this request to the cheapest/fastest available model that meets the criteria (e.g., mapping simple layout tasks to GPT-4o-mini, and complex narrative planning to Claude 3.5 Sonnet).

---

## 4. RESILIENCY & RETRY STRATEGY

### Failure Isolation
If the `ContentWriter` fails while generating Slide 4, it must not crash the entire presentation build.
- Localized Sandbox: Exceptions are caught per-agent/per-slide.

### Retry Policies
1. **Transient Errors** (e.g., 502 Bad Gateway, Timeout): Standard exponential backoff up to 3 times.
2. **Validation Errors** (e.g., JSON schema mismatch, layout rules violated): The Orchestrator intercepts the Validation Engine report, packages the error string, and triggers an intelligent retry feeding the error back to the agent ("Fix this: Max words exceeded"). Max 3 retries.
3. **Hard Failures**: If an agent fails 3 intelligent retries, the Orchestrator marks the slide as `FAILED`, completes the rest of the presentation, and logs a critical telemetry event.

---

## 5. PARALLEL EXECUTION & CHECKPOINTING

### Concurrency
Once the DAG hits the `AssetPlanner` node, the graph splinters. 
If the presentation has 10 slides, the Orchestrator launches 10 concurrent `ContentWriter` instances. The Orchestrator limits concurrency based on active rate limits.

### Checkpointing
After every major stage (Intent -> Planner -> Outline -> Layouts), the Orchestrator writes a snapshot of the `WorkflowState` to persistent storage (Redis/DB).
**Benefit**: If a workflow crashes at step 9, the user can hit "Resume" and the Orchestrator reloads from the Step 8 checkpoint, preventing duplicate token spend.

---

## 6. OBSERVABILITY & TELEMETRY

### Progress Reporting (Event System)
The Orchestrator emits structured events over a Pub/Sub layer or WebSocket:
- `WORKFLOW_STARTED`
- `AGENT_STARTED(agent_id, slide_id)`
- `AGENT_COMPLETED(agent_id, tokens_used, duration_ms)`
- `AGENT_VALIDATION_FAILED(issue_id)`
- `WORKFLOW_COMPLETED`
*This allows the UI to render real-time progress bars and "AI is thinking..." indicators.*

### Token Budgeting & Cost Tracking
The Orchestrator intercepts every request to the Model Router.
- It calculates `prompt_tokens` + `completion_tokens` multiplied by the specific model's pricing matrix.
- If a user reaches a global `MAX_COST_THRESHOLD`, the Orchestrator triggers an automatic `CANCELLED` state across all running promises.

### Caching
- **Semantic Caching**: If a user prompts the exact same strict parameters for a slide, the Orchestrator checks a semantic cache (like Redis). If a hit occurs with >95% similarity, the agent is bypassed entirely, instantly returning the cached JSON.
