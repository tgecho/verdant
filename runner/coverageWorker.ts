import path from "path";
import fs from "fs/promises";
import { parentPort, workerData } from "worker_threads";
import { Report } from "c8";
import defaultExclude from "@istanbuljs/schema/default-exclude";
import { Config, CoverageMsg, CoverageUpdate } from "./types";
import NYC from "nyc";

const tests: {
  [testPath: string]: { msg: CoverageUpdate; task: Promise<void> };
} = {};

parentPort?.on("message", async (msg: CoverageMsg) => {
  switch (msg.type) {
    case "CoverageUpdate": {
      tests[msg.testPath] = {
        msg,
        task: updateCoverage(msg).catch(console.error),
      };
      break;
    }
    case "CoveragePrint": {
      await printCoverage().catch(console.error);
      parentPort?.postMessage({ type: "PrintComplete" });
    }
  }
});
const config = workerData as Config;
const coverageTempDir = path.join(config.tmpDir, "coverage");

export async function updateCoverage({
  covDir,
  testPath,
}: CoverageUpdate): Promise<void> {
  // This yields for a moment just so we can keep checking to see if this has
  // been superseded by a newer update, but still clean up after.
  const stillCurrent = async () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(tests[testPath]?.msg.covDir === covDir), 0);
    });

  const report = new Report({
    exclude: defaultExclude,
    excludeAfterRemap: true,
    include: ["src/**/*"],
    reporter: ["json"],
    reportsDirectory: covDir,
    tempDirectory: covDir,
    all: true,
  });
  if (await stillCurrent()) {
    await report.run();
  }
  if (await stillCurrent()) {
    await fs.mkdir(coverageTempDir, { recursive: true });
    await fs.rename(
      path.join(covDir, "coverage-final.json"),
      path.join(coverageTempDir, `${path.basename(testPath)}.json`)
    );
  }
  await fs.rm(covDir, { recursive: true }).catch(console.warn);
  await stillCurrent();
}

async function printCoverage() {
  console.log("\nCollecting coverage...");
  await Promise.all(Object.values(tests).map((t) => t.task));
  // Note that our initial c8 collection above takes care of source mapping
  const nyc = new NYC({
    tempDir: coverageTempDir,
    reporter: config.reporters,
    exclude: defaultExclude,
    reportDir: config.coverageReportDir,
  });
  await nyc.report();
  // It appears that when nyc.report() resolves it hasn't really printed to the
  // console yet waiting for even 0 ms seems to be enough to reliably print.
  await sleep();
}

function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
