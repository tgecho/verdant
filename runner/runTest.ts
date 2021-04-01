import { Worker } from "worker_threads";
import { TestMsg, Log, TestResult, Config } from "./types";
import { getCovDir, collectCoverage } from "./coverage";
import fs from "fs/promises";
import path from "path";

export async function runTest(
  testPath: string,
  config: Config,
  onMessage: (msg: TestMsg) => void
): Promise<TestResult> {
  const env: { [k: string]: string } = {};
  if (config.coverage) {
    process.env["NODE_V8_COVERAGE"] ??= path.join(config.tmpDir, "v8cov");
    env["NODE_V8_COVERAGE"] = await getCovDir(config.tmpDir, testPath);
  }
  return new Promise((resolve) => {
    const worker = new Worker(testPath, {
      execArgv: ["--enable-source-maps"],
      env,
      stdout: true,
      stderr: true,
    });

    const logs: Log[] = [];
    worker.stdout.on("data", (data) => logs.push({ std: "out", data }));
    worker.stderr.on("data", (data) => logs.push({ std: "err", data }));

    const timeLimit = 10 * 1000;
    const timeout = setTimeout(() => {
      console.error(`Worker timed out after ${timeLimit}ms: ${testPath}`);
      worker.terminate();
    }, timeLimit);
    worker.on("message", onMessage);
    worker.on("error", console.error);
    worker.on("exit", async (code) => {
      clearTimeout(timeout);
      resolve({
        passed: code === 0,
        logs,
        covDir: env["NODE_V8_COVERAGE"],
      });
    });
  });
}
