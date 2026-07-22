import { PipelineRunner } from "../src/pipeline/PipelineRunner";
import { GeminiModelRouter } from "../src/orchestrator/GeminiModelRouter";
import { AIKeyManager } from "../src/orchestrator/key-manager";
import * as fs from "fs";
import * as path from "path";

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const envFile = fs.readFileSync(filePath, "utf-8");
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  }
}

async function main() {
  // Load environment files (.env.local takes priority via "don't overwrite" logic above)
  loadEnvFile(path.join(process.cwd(), ".env.local"));
  loadEnvFile(path.join(process.cwd(), ".env"));

  const promptArg = process.argv.slice(2).join(" ") || "Create a 10-slide presentation on Artificial Intelligence in Healthcare.";

  // Discover keys via AIKeyManager
  const discoveredKeys = AIKeyManager.discoverKeys("GEMINI_API_KEY");
  if (discoveredKeys.length === 0) {
    console.error("FATAL ERROR: No GEMINI_API_KEY found. Set GEMINI_API_KEY (and optionally _2 through _20) in .env.local.");
    process.exit(1);
  }

  console.log(`[AIKeyManager] Initialized — ${discoveredKeys.length} Gemini API key(s) discovered.`);
  console.log(`Starting real AI pipeline generation with prompt: "${promptArg}"`);

  const router = new GeminiModelRouter(discoveredKeys);
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
      model_used: "gemini-3.1-flash-lite",
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
