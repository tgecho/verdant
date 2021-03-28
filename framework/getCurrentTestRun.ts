import { parentPort } from "worker_threads";
import { Report } from "./types.js";
import { RUN_KEY, REPORT_KEY, TestRun } from "./index.js";
import { getGlobal } from "./helpers.js";

export function getCurrentTestRun(): TestRun {
  const globalVar = getGlobal<{ [REPORT_KEY]?: Report; [RUN_KEY]?: TestRun }>();
  const init = !globalVar[RUN_KEY];

  const report: Report = (globalVar[REPORT_KEY] ??= {
    started(path: string[]) {
      parentPort?.postMessage({ type: "started", path });
    },
    passed(path: string[]) {
      parentPort?.postMessage({ type: "passed", path });
    },
    skipped(path: string[]) {
      parentPort?.postMessage({ type: "skipped", path });
    },
    failed(path: string[], er: Error) {
      const error = {
        message: [er.name, er.message].filter((w) => w).join(": "),
        stack: er.stack,
      };
      parentPort?.postMessage({ type: "failed", path, error });
    },
  } as Report);

  const tests: TestRun = (globalVar[RUN_KEY] ??= {
    failed: 0,
    path: [],
    queue: Promise.resolve(),
    report,
  } as TestRun);

  if (init) {
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
