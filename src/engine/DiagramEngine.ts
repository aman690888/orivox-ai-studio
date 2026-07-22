/**
 * DiagramEngine — Generates content-aware Mermaid diagrams for Orivox V3.
 */

export interface DiagramSpec {
  variant: "flowchart" | "hierarchy" | "tree" | "arch" | "cycle";
  mermaid_string: string;
  title: string;
}

export class DiagramEngine {
  public static generateDiagram(topic: string, purpose: string): DiagramSpec {
    const text = `${topic} ${purpose}`.toLowerCase();

    if (text.includes("government") || text.includes("hierarchy") || text.includes("structure") || text.includes("org")) {
      return {
        variant: "hierarchy",
        title: "Organizational & Governance Structure",
        mermaid_string: `graph TD;
  Exec["Executive Branch"] --> Leg["Legislative Assembly"];
  Exec --> Jud["Judiciary & Courts"];
  Leg --> House1["Upper Chamber"];
  Leg --> House2["Lower Chamber"];
  Jud --> HighCourt["High Court"];
  Jud --> ApexCourt["Apex Court"];`,
      };
    }

    if (text.includes("network") || text.includes("cloud") || text.includes("system") || text.includes("tech") || text.includes("architecture")) {
      return {
        variant: "arch",
        title: "System Architecture & Network Flow",
        mermaid_string: `graph LR;
  Client["Client App"] --> Gateway["API Gateway"];
  Gateway --> Auth["Auth Service"];
  Gateway --> Core["Core Pipeline"];
  Core --> DB[("Database")];
  Core --> Cache[("Redis Cache")];`,
      };
    }

    if (text.includes("cycle") || text.includes("loop") || text.includes("feedback") || text.includes("agile")) {
      return {
        variant: "cycle",
        title: "Continuous Lifecycle",
        mermaid_string: `graph TD;
  Plan["1. Planning"] --> Dev["2. Development"];
  Dev --> Test["3. Testing"];
  Test --> Deploy["4. Deployment"];
  Deploy --> Monitor["5. Monitoring"];
  Monitor --> Plan;`,
      };
    }

    // Default flowchart
    return {
      variant: "flowchart",
      title: "Process & Execution Workflow",
      mermaid_string: `graph LR;
  Start(["Start Initiative"]) --> Phase1["Phase 1: Discovery"];
  Phase1 --> Decision{"Validation Passed?"};
  Decision -- Yes --> Phase2["Phase 2: Execution"];
  Decision -- No --> Refine["Refine Strategy"];
  Refine --> Phase1;
  Phase2 --> Finish(["Deliver Impact"]);`,
    };
  }
}
