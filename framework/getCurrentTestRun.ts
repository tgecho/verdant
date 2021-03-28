import { Report } from "./types.js";
import { TestRun } from "./index.js";
import { getGlobal } from "./helpers.js";
import { consoleReporter } from "./consoleReporter.js";

export const RUN_KEY = "__VERDANT_TEST_RUN";

declare const __VERDANT_TEST_REPORTER: Report;

export function getCurrentTestRun(): TestRun {
  const globalVar = getGlobal<{
    __VERDANT_TEST_REPORTER?: Report;
    [RUN_KEY]?: TestRun;
  }>();
  const init = !globalVar[RUN_KEY];

  if (typeof __VERDANT_TEST_REPORTER === "undefined") {
    globalVar.__VERDANT_TEST_REPORTER = consoleReporter;
  }
  const report = __VERDANT_TEST_REPORTER as Report;

  const tests: TestRun = (globalVar[RUN_KEY] ??= {
    failed: 0,
    path: [],
    queue: Promise.resolve(),
    report,
  } as TestRun);

  if (init && typeof process !== undefined) {
    process.on("unhandledRejection", (error) => {
      console.error("A test threw an unhandledRejection:\n", error);
      process.exit(1);
    });
    process.on("exit", (code) => {
      process.exitCode = code || tests.failed;
    });
  }

  return tests;
}
