import { parentPort } from "worker_threads";

export const parentPortReporter = {
  started(path: string[]): void {
    parentPort?.postMessage({ type: "started", path });
  },
  passed(path: string[]): void {
    parentPort?.postMessage({ type: "passed", path });
  },
  skipped(path: string[]): void {
    parentPort?.postMessage({ type: "skipped", path });
  },
  failed(path: string[], er: Error): void {
    const error = {
      message: [er.name, er.message].filter((w) => w).join(": "),
      stack: er.stack,
    };
    parentPort?.postMessage({ type: "failed", path, error });
  },
};
