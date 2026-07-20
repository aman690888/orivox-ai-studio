import { PipelineRunner } from "../src/pipeline/PipelineRunner";
import { GeminiModelRouter } from "../src/orchestrator/GeminiModelRouter";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = match[2];
      }
    });
  }

  const promptArg = process.argv.slice(2).join(" ") || "Create a 10-slide presentation on Artificial Intelligence in Healthcare.";

  console.log(`Starting real AI pipeline generation with prompt: "${promptArg}"`);

  if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set. Please set the environment variable.");
    process.exit(1);
  }

  const router = new GeminiModelRouter();
  const runner = new PipelineRunner(router);

  const startTime = Date.now();

  try {
    const ir = await runner.executePipeline(promptArg);
    
    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const irPath = path.join(outputDir, "presentation-ir.json");
    fs.writeFileSync(irPath, JSON.stringify(ir, null, 2), "utf-8");
    console.log(`\nSuccessfully saved PresentationIR to ${irPath}`);

    const reportPath = path.join(outputDir, "pipeline-report.json");
    const report = {
      execution_time_ms: Date.now() - startTime,
      model_used: "gemini-2.5-pro / gemini-2.5-flash",
      status: "SUCCESS"
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`Successfully saved Pipeline Report to ${reportPath}`);

    // Print out the runner's internal report
    runner.generateReport();
    
  } catch (error: any) {
    console.error("\n[FATAL] Pipeline execution failed:", error);
    process.exit(1);
  }
}

main();
