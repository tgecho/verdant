import sinon from "sinon";
import { CleanupFn } from "./index.js";
import memoize from "lodash/memoize";

export function getGlobal<T>(): typeof globalThis & T {
  /* eslint @typescript-eslint/ban-ts-comment: "off" */
  return typeof window !== "undefined"
    ? window
    : // @ts-ignore
    typeof WorkerGlobalScope !== "undefined"
    ? self
    : typeof global !== "undefined"
    ? global
    : Function("return this;")();
}

function withLazyProp<O, N extends keyof O>(
  obj: O,
  name: N,
  init: (obj: O) => O[N]
): O & Record<N, O[N]> {
  if (!Object.getOwnPropertyDescriptor(obj, name)) {
    let value;
    Object.defineProperty(obj, name, {
      get() {
        return (value ??= init(obj));
      },
    });
  }
  return obj;
}

const makeMakeJSDOM = memoize(async () => {
  const { JSDOM } = await import("jsdom");
  return memoize(() => new JSDOM());
});

export async function ensureBrowserDOM(globalVar = getGlobal()): Promise<void> {
  const makeJSDOM = await makeMakeJSDOM();
  withLazyProp(globalVar, "window", (g) => {
    const { window } = makeJSDOM();
    withLazyProp(window, "indexedDB", () => {
      const indexedDB = g.indexedDB;
      return indexedDB;
    });
    // I know
    // eslint-disable-next-line
    return window as any;
  });
  withLazyProp(globalVar, "document", (g) => g.window.document);
}

const makeMakeIDB = memoize(async () => {
  const FDBFactory = await import("fake-indexeddb/lib/FDBFactory");
  return memoize(() => new FDBFactory.default());
});

export async function ensureIndexedDB(globalVar = getGlobal()): Promise<void> {
  const makeIDB = await makeMakeIDB();
  withLazyProp(globalVar, "indexedDB", makeIDB);
}

export function fakeTimers(cleanup: CleanupFn): sinon.SinonFakeTimers {
  const clock = sinon.useFakeTimers();
  cleanup(clock.restore);
  return clock;
}

export async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    throw new Error(`Promise resolved with ${await promise}`);
  } catch (error) {
    return error;
  }
}
