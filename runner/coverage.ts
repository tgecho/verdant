import path from "path";
import fs from "fs/promises";
import { Worker } from "worker_threads";
import { CoverageTask } from "./types";

export async function getCovDir(tmpDir: string, testPath: string) {
  const covDir = path.join(
    tmpDir,
    "v8cov",
    `${path.basename(testPath)}_${Date.now()}_${Math.random()}`
  );
  await fs.mkdir(covDir, { recursive: true });
  return covDir;
}

export function createCoverageWorker(reportPath: string) {
  const worker = new Worker(require.resolve("./coverageWorker"));
  worker.on("error", console.error);
  worker.on("exit", console.error);
  return {
    update(msg: CoverageTask) {
      worker.postMessage(msg);
    },
    close() {
      worker.terminate();
    },
  };
}
