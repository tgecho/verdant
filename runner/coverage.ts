import path from "path";
import fs from "fs/promises";
import { Worker } from "worker_threads";
import { Config, CoverageTask } from "./types";

export async function getCovDir(
  tmpDir: string,
  testPath: string
): Promise<string> {
  const covDir = path.join(
    tmpDir,
    "v8cov",
    `${path.basename(testPath)}_${Date.now()}_${Math.random()}`
  );
  await fs.mkdir(covDir, { recursive: true });
  return covDir;
}

export type CoverageWorker = {
  update: (msg: CoverageTask) => void;
  close: () => void;
};

export function createCoverageWorker(config: Config): CoverageWorker {
  const worker = new Worker(require.resolve("./coverageWorker"), {
    workerData: config,
  });
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
