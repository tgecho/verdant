import { Worker } from "worker_threads";
import { TestMsg, Log, TestResult } from "./types";

export async function runTest(
  testPath: string,
  onMessage: (msg: TestMsg) => void
): Promise<TestResult> {
  return new Promise((resolve) => {
    const worker = new Worker(testPath, {
      execArgv: ["--enable-source-maps"],
      // env: { NODE_V8_COVERAGE: "./build/cov" },
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
      });
    });
  });
}
