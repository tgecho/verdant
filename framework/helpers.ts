import sinon from "sinon";
import { CleanupFn } from "./index.js";
import { memoize } from "lodash-es";
import { DOMWindow, JSDOM } from "jsdom";

import FDBFactory from "fake-indexeddb/lib/FDBFactory.js";
import FDBCursor from "fake-indexeddb/lib/FDBCursor.js";
import FDBCursorWithValue from "fake-indexeddb/lib/FDBCursorWithValue.js";
import FDBDatabase from "fake-indexeddb/lib/FDBDatabase.js";
import FDBIndex from "fake-indexeddb/lib/FDBIndex.js";
import FDBKeyRange from "fake-indexeddb/lib/FDBKeyRange.js";
import FDBObjectStore from "fake-indexeddb/lib/FDBObjectStore.js";
import FDBOpenDBRequest from "fake-indexeddb/lib/FDBOpenDBRequest.js";
import FDBRequest from "fake-indexeddb/lib/FDBRequest.js";
import FDBTransaction from "fake-indexeddb/lib/FDBTransaction.js";
import FDBVersionChangeEvent from "fake-indexeddb/lib/FDBVersionChangeEvent.js";

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

const makeJSDOM = memoize(() => new JSDOM(""));
const makeIDB = memoize(() => new FDBFactory());

export function ensureBrowserDOM(globalVar = getGlobal()): void {
  withLazyProp(globalVar, "indexedDB", (g) => {
    const indexedDB = makeIDB();
    installFakeIDBConstructors(g);
    return indexedDB;
  });
  withLazyProp(globalVar, "window", (g) => {
    const { window } = makeJSDOM();
    withLazyProp(window, "indexedDB", () => {
      const indexedDB = g.indexedDB;
      installFakeIDBConstructors(window);
      return indexedDB;
    });
    // I know
    // eslint-disable-next-line
    return window as any;
  });
  withLazyProp(globalVar, "document", (g) => g.window.document);
}

function installFakeIDBConstructors(global: DOMWindow | typeof globalThis) {
  global["IDBCursor"] = FDBCursor;
  global["IDBCursorWithValue"] = FDBCursorWithValue;
  global["IDBDatabase"] = FDBDatabase;
  global["IDBFactory"] = FDBFactory;
  global["IDBIndex"] = FDBIndex;
  global["IDBKeyRange"] = FDBKeyRange;
  global["IDBObjectStore"] = FDBObjectStore;
  global["IDBOpenDBRequest"] = FDBOpenDBRequest;
  global["IDBRequest"] = FDBRequest;
  global["IDBTransaction"] = FDBTransaction;
  global["IDBVersionChangeEvent"] = FDBVersionChangeEvent;
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
