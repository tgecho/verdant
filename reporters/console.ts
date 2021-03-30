import { ReportedError, Reporter } from "./types";

export const consoleReporter: Reporter = {
  started(path: string[]): void {
    console.log("STARTED", path.join("/"));
  },
  passed(path: string[]): void {
    console.log("PASSED", path.join("/"));
  },
  skipped(path: string[]): void {
    console.warn("SKIPPED", path.join("/"));
  },
  failed(path: string[], error: ReportedError): void {
    if (typeof process !== undefined) process.exitCode = 1;
    console.log("FAILED", path.join(" / "));
    console.error(error.message);
    if (error.stack) console.log(error.stack);
  },
};
