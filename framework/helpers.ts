import sinon from "sinon";
import { CleanupFn } from "./index.js";

import { DOMWindow, JSDOM } from "jsdom";

//@ts-ignore
import FDBFactory from "fake-indexeddb/build/FDBFactory";
//@ts-ignore
import FDBCursor from "fake-indexeddb/build/FDBCursor";
//@ts-ignore
import FDBCursorWithValue from "fake-indexeddb/build/FDBCursorWithValue";
//@ts-ignore
import FDBDatabase from "fake-indexeddb/build/FDBDatabase";
//@ts-ignore
import FDBIndex from "fake-indexeddb/build/FDBIndex";
//@ts-ignore
import FDBKeyRange from "fake-indexeddb/build/FDBKeyRange";
//@ts-ignore
import FDBObjectStore from "fake-indexeddb/build/FDBObjectStore";
//@ts-ignore
import FDBOpenDBRequest from "fake-indexeddb/build/FDBOpenDBRequest";
//@ts-ignore
import FDBRequest from "fake-indexeddb/build/FDBRequest";
//@ts-ignore
import FDBTransaction from "fake-indexeddb/build/FDBTransaction";
//@ts-ignore
import FDBVersionChangeEvent from "fake-indexeddb/build/FDBVersionChangeEvent";

export function getGlobal<T = {}>(): typeof globalThis & T {
  return typeof window !== "undefined"
    ? window
    : //@ts-ignore
    typeof WorkerGlobalScope !== "undefined"
    ? self
    : typeof global !== "undefined"
    ? global
    : Function("return this;")();
}

export function withLazyProp<O, N extends keyof O>(
  obj: O,
  name: N,
  init: (obj: O) => O[N]
) {
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

export function withBrowserDOM(globalVar = getGlobal()) {
  return withLazyProp(globalVar as any, "window", (g) => {
    const { window } = new JSDOM("");
    // @ts-ignore
    g.window = window;
    g.document = window.document;

    return withLazyProp(window, "indexedDB", installFakeIDB);
  });
}

function installFakeIDB(window: DOMWindow) {
  const indexedDB = new FDBFactory();
  // @ts-ignore .indexedDB is normally readonly
  window.indexedDB = indexedDB;
  window["IDBCursor"] = FDBCursor;
  window["IDBCursorWithValue"] = FDBCursorWithValue;
  window["IDBDatabase"] = FDBDatabase;
  window["IDBFactory"] = FDBFactory;
  window["IDBIndex"] = FDBIndex;
  window["IDBKeyRange"] = FDBKeyRange;
  window["IDBObjectStore"] = FDBObjectStore;
  window["IDBOpenDBRequest"] = FDBOpenDBRequest;
  window["IDBRequest"] = FDBRequest;
  window["IDBTransaction"] = FDBTransaction;
  window["IDBVersionChangeEvent"] = FDBVersionChangeEvent;
  return indexedDB;
}

export function fakeTimers(cleanup: CleanupFn) {
  const clock = sinon.useFakeTimers();
  cleanup(clock.restore);
  return clock;
}

export async function rejection<T>(promise: Promise<T>) {
  try {
    console.warn(`Promise resolved with`, await promise);
  } catch (error) {
    return error;
  }
}
