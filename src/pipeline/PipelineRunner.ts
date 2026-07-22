import { AIWorkflowOrchestrator } from "../orchestrator/AIWorkflowOrchestrator";
import { ExecutionGraph } from "../orchestrator/ExecutionGraph";
import { WorkflowState } from "../orchestrator/WorkflowState";
import { WorkflowBudget } from "../orchestrator/WorkflowBudget";
import { ValidatedIR } from "../types/presentation-ir.types";
import { IAgent, ModelCapabilities } from "../orchestrator/types";

// Existing Agents
import { IntentAgent } from "../agents/intent/IntentAgent";
import { PresentationPlannerAgent } from "../agents/planner/PresentationPlannerAgent";
import { SectionPlannerAgent } from "../agents/section-planner/SectionPlannerAgent";
import { SlidePlannerAgent } from "../agents/slide-planner/SlidePlannerAgent";
import { LayoutPlannerAgent } from "../agents/layout-planner/LayoutPlannerAgent";
import { ComponentPlannerAgent } from "../agents/component-planner/ComponentPlannerAgent";
import { AssetPlannerAgent } from "../agents/asset-planner/AssetPlannerAgent";
import { ContentPlannerAgent } from "../agents/content-planner/ContentPlannerAgent";
import { ContentWriterAgent } from "../agents/content-writer/ContentWriterAgent";

// New Next-Gen Architecture Engines
import { ResearchEngineAgent } from "../agents/research/ResearchEngineAgent";
import { PresentationDirectorAgent } from "../agents/director/PresentationDirectorAgent";
import { PresentationCriticAgent } from "../agents/critic/PresentationCriticAgent";
import { ThemeEngine } from "../engine/ThemeEngine";

// Compiler
import { PresentationCompiler } from "../compiler/PresentationCompiler";
import { IModelRouter } from "../orchestrator/ModelRouter";

export class CompilerAgentWrapper implements IAgent<any, ValidatedIR> {
  public id = "presentation-compiler";
  public model_requirements: ModelCapabilities = {};

  constructor(private compiler: PresentationCompiler) {}

  public async execute(context: any, signal: AbortSignal): Promise<ValidatedIR> {
    return this.compiler.compile(context);
  }
}

export class PipelineRunner {
  private orchestrator!: AIWorkflowOrchestrator;
  private eventLogs: any[] = [];
  private startTime: number = 0;

  constructor(private modelRouter: IModelRouter) {
    this.setupPipeline();
  }

  private setupPipeline() {
    const graph = new ExecutionGraph();

    // 1. Research Engine Stage
    graph.registerNode({
      id: "research-stage",
      agent: new ResearchEngineAgent(this.modelRouter),
      dependencies: [],
      extractor: (state) => ({ userPrompt: state.getEphemeral<string>("UserPrompt") }),
      mutator: (state, output) => state.updateEphemeral("ResearchOutput", output),
    });

    // 2. Presentation Director Stage (Does NOT write slides — plans strategic direction)
    graph.registerNode({
      id: "director-stage",
      agent: new PresentationDirectorAgent(this.modelRouter),
      dependencies: ["research-stage"],
      extractor: (state) => ({
        userPrompt: state.getEphemeral<string>("UserPrompt"),
        research: state.getEphemeral("ResearchOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("DirectorOutput", output),
    });

    // 3. Intent Stage
    graph.registerNode({
      id: "intent-stage",
      agent: new IntentAgent(this.modelRouter),
      dependencies: ["director-stage"],
      extractor: (state) => ({ userPrompt: state.getEphemeral<string>("UserPrompt") }),
      mutator: (state, output) => state.updateEphemeral("PresentationIntent", output),
    });

    // 4. Presentation Planner Stage
    graph.registerNode({
      id: "presentation-planner-stage",
      agent: new PresentationPlannerAgent(this.modelRouter),
      dependencies: ["intent-stage", "director-stage"],
      extractor: (state) => ({ intent: state.getEphemeral("PresentationIntent") }),
      mutator: (state, output) => state.updateEphemeral("PresentationPlan", output),
    });

    // 5. Section Planner Stage
    graph.registerNode({
      id: "section-planner-stage",
      agent: new SectionPlannerAgent(this.modelRouter),
      dependencies: ["presentation-planner-stage"],
      extractor: (state) => ({ presentationPlan: state.getEphemeral("PresentationPlan") }),
      mutator: (state, output) => state.updateEphemeral("SectionPlanOutput", output),
    });

    // 6. Slide Planner Stage
    graph.registerNode({
      id: "slide-planner-stage",
      agent: new SlidePlannerAgent(this.modelRouter),
      dependencies: ["section-planner-stage"],
      extractor: (state) => ({
        presentationPlan: state.getEphemeral("PresentationPlan"),
        sectionPlan: state.getEphemeral("SectionPlanOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("SlidePlanOutput", output),
    });

    // 7. Layout Planner Stage
    graph.registerNode({
      id: "layout-planner-stage",
      agent: new LayoutPlannerAgent(this.modelRouter),
      dependencies: ["slide-planner-stage"],
      extractor: (state) => ({ slidePlan: state.getEphemeral("SlidePlanOutput") }),
      mutator: (state, output) => state.updateEphemeral("LayoutPlanOutput", output),
    });

    // 8. Component Planner Stage
    graph.registerNode({
      id: "component-planner-stage",
      agent: new ComponentPlannerAgent(this.modelRouter),
      dependencies: ["layout-planner-stage"],
      extractor: (state) => ({ layoutPlan: state.getEphemeral("LayoutPlanOutput") }),
      mutator: (state, output) => state.updateEphemeral("ComponentPlanOutput", output),
    });

    // 9. Asset Planner Stage
    graph.registerNode({
      id: "asset-planner-stage",
      agent: new AssetPlannerAgent(this.modelRouter),
      dependencies: ["component-planner-stage", "slide-planner-stage", "layout-planner-stage"],
      extractor: (state) => ({
        slidePlan: state.getEphemeral("SlidePlanOutput"),
        layoutPlan: state.getEphemeral("LayoutPlanOutput"),
        componentPlan: state.getEphemeral("ComponentPlanOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("AssetPlanOutput", output),
    });

    // 10. Content Planner Stage
    graph.registerNode({
      id: "content-planner-stage",
      agent: new ContentPlannerAgent(this.modelRouter),
      dependencies: ["slide-planner-stage", "component-planner-stage", "asset-planner-stage"],
      extractor: (state) => ({
        slidePlan: state.getEphemeral("SlidePlanOutput"),
        componentPlan: state.getEphemeral("ComponentPlanOutput"),
        assetPlan: state.getEphemeral("AssetPlanOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("ContentPlanOutput", output),
    });

    // 11. Content Writer Stage
    graph.registerNode({
      id: "content-writer-stage",
      agent: new ContentWriterAgent(this.modelRouter),
      dependencies: [
        "intent-stage",
        "slide-planner-stage",
        "layout-planner-stage",
        "component-planner-stage",
        "asset-planner-stage",
        "content-planner-stage",
      ],
      extractor: (state) => ({
        intent: state.getEphemeral("PresentationIntent"),
        slidePlan: state.getEphemeral("SlidePlanOutput"),
        layoutPlan: state.getEphemeral("LayoutPlanOutput"),
        componentPlan: state.getEphemeral("ComponentPlanOutput"),
        assetPlan: state.getEphemeral("AssetPlanOutput"),
        contentPlan: state.getEphemeral("ContentPlanOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("ContentOutput", output),
    });

    // 12. Presentation Critic Stage (AI Evaluation & Scoring)
    graph.registerNode({
      id: "critic-stage",
      agent: new PresentationCriticAgent(this.modelRouter),
      dependencies: ["content-writer-stage"],
      extractor: (state) => ({
        slidePlan: state.getEphemeral("SlidePlanOutput"),
        layoutPlan: state.getEphemeral("LayoutPlanOutput"),
        contentOutput: state.getEphemeral("ContentOutput"),
      }),
      mutator: (state, output) => state.updateEphemeral("CriticOutput", output),
    });

    // 13. Presentation Compiler Stage
    const compilerAgent = new CompilerAgentWrapper(new PresentationCompiler());
    graph.registerNode({
      id: "compiler-stage",
      agent: compilerAgent,
      dependencies: ["critic-stage"],
      extractor: (state) => ({
        intent: state.getEphemeral("PresentationIntent"),
        presentationPlan: state.getEphemeral("PresentationPlan"),
        sectionPlan: state.getEphemeral("SectionPlanOutput"),
        slidePlan: state.getEphemeral("SlidePlanOutput"),
        layoutPlan: state.getEphemeral("LayoutPlanOutput"),
        componentPlan: state.getEphemeral("ComponentPlanOutput"),
        assetPlan: state.getEphemeral("AssetPlanOutput"),
        contentPlan: state.getEphemeral("ContentPlanOutput"),
        contentOutput: state.getEphemeral("ContentOutput"),
        director: state.getEphemeral("DirectorOutput"),
        research: state.getEphemeral("ResearchOutput"),
        critic: state.getEphemeral("CriticOutput"),
      }),
      mutator: (state, output: ValidatedIR) => state.updateIR((draft) => Object.assign(draft, output)),
    });

    const initialIR = { id: "", version: "3.0.0", stage: "prompt", metadata: {}, theme: {}, slide_order: [], slides: {} } as any;

    this.orchestrator = new AIWorkflowOrchestrator(
      { workflow_id: "orivox-v3-generation", enable_telemetry: true },
      new WorkflowState(initialIR),
      graph,
      new WorkflowBudget({ max_tokens: 1000000, max_cost_usd: 5.0, per_agent_cost_usd: {} }),
    );

    // Setup logging telemetry
    this.orchestrator.on("AGENT_STARTED", (p) => this.log(`[AGENT_STARTED] ${p.payload?.agent_id}`));
    this.orchestrator.on("AGENT_COMPLETED", (p) => this.log(`[AGENT_COMPLETED] ${p.payload?.agent_id} (${p.payload?.duration_ms}ms)`));
    this.orchestrator.on("AGENT_FAILED", (p) => this.log(`[AGENT_FAILED] ${p.payload?.agent_id} - ${p.payload?.error}`));
    this.orchestrator.on("WORKFLOW_STARTED", () => this.log(`[WORKFLOW_STARTED]`));
    this.orchestrator.on("WORKFLOW_COMPLETED", () => this.log(`[WORKFLOW_COMPLETED]`));
  }

  private log(msg: string) {
    const ts = (Date.now() - this.startTime).toString().padStart(5, "0");
    const formatted = `[+${ts}ms] ${msg}`;
    this.eventLogs.push(formatted);
    console.log(formatted);
  }

  public async executePipeline(userPrompt: string): Promise<ValidatedIR> {
    this.startTime = Date.now();
    this.log(`Initiating executePipeline() with prompt: "${userPrompt}"`);

    (this.orchestrator as any).contextStore.setState(
      (this.orchestrator as any).contextStore.getState().updateEphemeral("UserPrompt", userPrompt),
    );

    try {
      const finalState = await this.orchestrator.run();
      this.generateReport();
      return finalState.ir as ValidatedIR;
    } catch (err: any) {
      this.log(`[PIPELINE_ERROR] ${err.message}`);
      throw err;
    }
  }

  public cancel() {
    this.orchestrator.cancel();
  }

  public generateReport() {
    const totalTime = Date.now() - this.startTime;
    console.log("\n================ PIPELINE EXECUTION REPORT ================");
    console.log(`Total Execution Time: ${totalTime}ms`);
    console.log(`Stages Executed: 13`);
    console.log("Execution Log:");
    this.eventLogs.forEach((log) => console.log(`  ${log}`));
    console.log("===========================================================\n");
  }
}
