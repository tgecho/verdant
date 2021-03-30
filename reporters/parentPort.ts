import { parentPort } from "worker_threads";
import { ReportedError, Reporter } from "./types";

export const parentPortReporter: Reporter = {
  started(path: string[]): void {
    parentPort?.postMessage({ type: "started", path });
  },
  passed(path: string[]): void {
    parentPort?.postMessage({ type: "passed", path });
  },
  skipped(path: string[]): void {
    parentPort?.postMessage({ type: "skipped", path });
  },
  failed(path: string[], error: ReportedError): void {
    parentPort?.postMessage({ type: "failed", path, error });
  },
};
