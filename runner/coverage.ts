import path from "path";
import fs from "fs/promises";
import { Worker } from "worker_threads";
import { Config } from "./types";

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
  update: (testPath: string, covDir: string) => void;
  print: () => Promise<void>;
  close: () => void;
};

export function createCoverageWorker(config: Config): CoverageWorker {
  const worker = new Worker(require.resolve("./coverageWorker"), {
    workerData: config,
  });
  worker.on("error", console.error);
  worker.on("exit", console.error);
  return {
    update(testPath: string, covDir: string) {
      worker.postMessage({ type: "CoverageUpdate", testPath, covDir });
    },
    print() {
      worker.postMessage({ type: "CoveragePrint" });
      return new Promise((resolve, reject) => {
        worker.on("message", (msg) => {
          if (msg.type === "PrintComplete") {
            resolve();
          }
        });
        setTimeout(reject, 30000);
      });
    },
    close() {
      worker.terminate();
    },
  };
}
