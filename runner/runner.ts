import debounce from "lodash/debounce";
import path from "path";
import { TestBuilder, testBuilder } from "./testBuilder";
import { Config, TestResult } from "./types";
import { Reporter } from "../reporters/types";
import { runTest } from "./runTest";
import { watch } from "./watch";
import { makeMultiMatcher } from "./makeMultiMatcher";
import { createCoverageWorker } from "./coverage";

type Runner = {
  stop: () => Promise<void>;
};

export function runner(config: Config, callback: Reporter): Runner {
  const filesToTests: { [path: string]: Set<string> } = {};
  const tests: { [path: string]: TestBuilder } = {};

  let queuedTests = new Set<string>();
  const runningTests = new Map<string, Promise<TestResult | void>>();

  const isTest = makeMultiMatcher(config.tests);

  const coverage = createCoverageWorker(config);

  const queueRun = debounce(
    () => {
      if (queuedTests.size === 0) return;

      callback.queued?.(Array.from(queuedTests));

      for (const testPath of queuedTests) {
        const test = (tests[testPath] ??= testBuilder(testPath, config));
        const run: Promise<TestResult | void> = test
          .build()
          .then((build) => {
            for (const inputPath of build.inputs) {
              (filesToTests[inputPath] ??= new Set()).add(testPath);
            }
            // TODO: clean up any old input paths that are no longer relevant
            // Only run the test if it hasn't been requeued by a file change
            if (!queuedTests.has(testPath) && build.bundle) {
              const bundlePath = path.join(config.cwd, build.bundle);
              return runTest(bundlePath, config, (msg) => {
                const path = [testPath, ...msg.path];
                if (msg.type === "failed") {
                  callback.failed?.(path, msg.error);
                } else {
                  callback[msg.type]?.(path);
                }
              }).then((result) => {
                if (result.covDir) {
                  coverage.update({ testPath, covDir: result.covDir });
                }
                return { testPath, ...result };
              });
            }
            return;
          })
          .catch(console.error);

        runningTests.set(testPath, run);
        run.then((result) => {
          if (result && runningTests.get(testPath) === run) {
            callback.logs?.([testPath], result.logs); // TODO: logs?
            runningTests.delete(testPath);
          }
        });
      }
      // Reset the queue
      queuedTests = new Set();
      // TODO: right now we're calling "done" when the batch of tests as of this
      // moment are complete, but we should probably have a more robust ongoing
      // sense of "done". We currently mostly care for single run cases, so in
      // theory if we stop finding new test files for more than the debounce
      // time we might miss them.
      const allPassed = Promise.all(runningTests.values()).then(
        async (results) => {
          callback.done?.();

          for (const result of results) {
            if (result && result.passed === false) {
              return false;
            }
          }
          return true;
        }
      );
      if (!config.watch) {
        allPassed.then(async (passed) => {
          process.exit(passed ? 0 : 1);
        });
      }
    },
    100,
    { leading: false }
  );

  const watcher = watch(
    config,
    (path) => {
      if (isTest(path)) {
        queuedTests.add(path);
        queueRun();
      } else {
        const tests = filesToTests[path];
        if (tests) {
          for (const test of tests) {
            queuedTests.add(test);
            queueRun();
          }
        }
      }
    },
    // TODO: handle deletes (cleanup bundles, coverage .json, etc...)
    console.log
  );

  return {
    stop() {
      coverage.close();
      return watcher.then((w) => w.close());
    },
  };
}
