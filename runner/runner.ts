import { debounce } from "lodash-es";
import path from "path";
import { TestBuilder, testBuilder } from "./testBuilder.js";
import { Callbacks, Config, TestResult } from "./types.js";
import { runTest } from "./runTest.js";
import { watch } from "./watch.js";
import { makeMultiMatcher } from "./makeMultiMatcher.js";

type Runner = {
  stop: () => Promise<void>;
};

export function runner(config: Config, callback: Callbacks): Runner {
  const filesToTests: { [path: string]: Set<string> } = {};
  const tests: { [path: string]: TestBuilder } = {};

  let queuedTests = new Set<string>();
  const runningTests = new Map<string, Promise<TestResult | void>>();

  const isTest = makeMultiMatcher(config.tests);

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
              return runTest(bundlePath, (msg) => {
                if (msg.type === "failed") {
                  callback.failed?.(testPath, msg.path, msg.error);
                } else {
                  callback[msg.type]?.(testPath, msg.path);
                }
              });
            }
            return;
          })
          .catch(console.error);

        runningTests.set(testPath, run);
        run.then((result) => {
          if (result && runningTests.get(testPath) === run) {
            callback.logs?.(testPath, result.logs); // TODO: logs?
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
      const allPassed = Promise.all(runningTests.values()).then((results) => {
        callback.done?.();
        for (const result of results) {
          if (result && result.passed === false) {
            return false;
          }
        }
        return true;
      });
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
    // TODO: handle deletes
    console.log
  );

  return {
    stop() {
      return watcher.then((w) => w.close());
    },
  };
}
