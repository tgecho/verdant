import { CleanupFn, HookFn } from "./types";

export function createHookFn(): { hook: HookFn; cleanupHooks: () => void } {
  const cleanupFns: (() => void)[] = [];
  function cleanup(after: () => void) {
    cleanupFns.push(after);
  }
  function hook<T>(make: (cleanup: CleanupFn) => T): T {
    return make(cleanup);
  }
  hook.cleanup = cleanup;
  function cleanupHooks() {
    cleanupFns.forEach(
      (fn) =>
        new Promise(function runCleanup(resolve) {
          resolve(fn());
        })
    );
  }
  return { hook, cleanupHooks };
}
