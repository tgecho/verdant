import path from "path";
import fs from "fs/promises";
import { parentPort } from "worker_threads";
import { Report } from "c8";
import defaultExclude from "@istanbuljs/schema/default-exclude";
import debounce from "lodash/debounce";
import { CoverageTask } from "./types";
import NYC from "nyc";

const tests: { [testPath: string]: string } = {};

parentPort?.on("message", collectTestCoverage);

export async function collectTestCoverage({ covDir, testPath }: CoverageTask) {
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
    await fs.mkdir(`node_modules/.verdant_tmp/coverage`, { recursive: true });
    await fs.rename(
      path.join(covDir, "coverage-final.json"),
      `node_modules/.verdant_tmp/coverage/${path.basename(testPath)}.json`
    );
  }
  fs.rmdir(covDir, { recursive: true }).catch(console.warn);
  if (await stillCurrent()) {
    consolidateCoverage();
  }
}

const consolidateCoverage = debounce(async () => {
  console.log("\nCollecting coverage...");
  // Note that our initial c8 collection above takes care of source mapping
  const nyc = new NYC({
    tempDir: "node_modules/.verdant_tmp/coverage/",
    reporter: ["text"],
    exclude: defaultExclude,
    // include: "src/**/*",
    // cwd: "/Users/erik/code/sync",
    // exclude: ["sync/vendor/*"],
    // excludeAfterRemap: true,
  });
  await nyc.report();
}, 100);
