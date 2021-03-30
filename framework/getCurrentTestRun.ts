import { TestRun } from "./index";
import { getGlobal } from "./helpers";
import { consoleReporter } from "../reporters/console";
import { Reporter } from "../reporters/types";

export const RUN_KEY = "__VERDANT_TEST_RUN";

declare const __VERDANT_TEST_REPORTER: Reporter;

export function getCurrentTestRun(): TestRun {
  const globalVar = getGlobal<{
    __VERDANT_TEST_REPORTER?: Reporter;
    [RUN_KEY]?: TestRun;
  }>();
  const init = !globalVar[RUN_KEY];

  if (typeof __VERDANT_TEST_REPORTER === "undefined") {
    globalVar.__VERDANT_TEST_REPORTER = consoleReporter;
  }
  const report = __VERDANT_TEST_REPORTER as Reporter;

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
