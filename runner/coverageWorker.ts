import path from "path";
import fs from "fs/promises";
import { parentPort, workerData } from "worker_threads";
import { Report } from "c8";
import defaultExclude from "@istanbuljs/schema/default-exclude";
import debounce from "lodash/debounce";
import { Config, CoverageTask } from "./types";
import NYC from "nyc";

const tests: { [testPath: string]: string } = {};

parentPort?.on("message", collectTestCoverage);
const config = workerData as Config;
const coverageTempDir = path.join(config.tmpDir, "coverage");

export async function collectTestCoverage({
  covDir,
  testPath,
}: CoverageTask): Promise<void> {
  tests[testPath] = covDir;
  // This yields for a moment just so we can keep checking to see if this has
  // been superseded by a newer update, but still clean up after.
  const stillCurrent = async () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(tests[testPath] === covDir), 1);
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
  fs.rm(covDir, { recursive: true }).catch(console.warn);
  if (await stillCurrent()) {
    consolidateCoverage();
  }
}

const consolidateCoverage = debounce(async () => {
  console.log("\nCollecting coverage...");
  // Note that our initial c8 collection above takes care of source mapping
  const nyc = new NYC({
    tempDir: coverageTempDir,
    reporter: config.reporters,
    exclude: defaultExclude,
    reportDir: config.coverageReportDir,
  });
  await nyc.report();
}, 100);
