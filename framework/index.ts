import { Reporter } from "../reporters/types";
import { getCurrentTestRun } from "./getCurrentTestRun";
import { createHookFn } from "./hook";
import { CleanupFn, HookFn } from "./types";
export { CleanupFn, HookFn };

// This is until Typescript adds support for node's exports field
// https://github.com/microsoft/TypeScript/issues/33079
export * from "./helpers";

export type TestRun = {
  failed: number;
  path: string[];
  queue: Promise<unknown>;
  report: Reporter;
};

export function group(name: string, fn: () => void): void {
  const tests = getCurrentTestRun();
  tests.path.push(name);
  fn();
  tests.path.pop();
}

test.skip = (name: string, _fn: unknown) => {
  const tests = getCurrentTestRun();
  const path = [...tests.path, name];
  tests.report.skipped?.(path);
};

export function test(
  name: string,
  fn: (hook: HookFn) => void | Promise<void>
): void {
  const tests = getCurrentTestRun();

  const path = [...tests.path, name];
  tests.report.started?.(path);

  const { hook, cleanupHooks } = createHookFn();

  // TODO: set a timeout outside the worker as well?
  // TODO: figure out how to fail the whole test
  const clear = clearTimeout; // make sure we have an unmocked clear fn
  const timeout = setTimeout(() => {
    const error = new Error("Test Timeout");
    tests.report.failed?.(path, {
      message: "Test Timeout",
      stack: error.stack,
    });
    cleanupHooks();
  }, 2 * 1000);
  hook.cleanup(() => clear(timeout));

  tests.queue = tests.queue
    .then(function runTest() {
      return fn(hook);
    })
    .finally(cleanupHooks)
    .then(() => tests.report.passed?.(path))
    .catch((error: Error) => {
      tests.report.failed?.(path, {
        message: [error.name, error.message].filter((w) => w).join(": "),
        stack: error.stack,
      });
    });
}
