export const consoleReporter = {
  started(path: string[]): void {
    console.log("STARTED", path.join("/"));
  },
  passed(path: string[]): void {
    console.log("PASSED", path.join("/"));
  },
  skipped(path: string[]): void {
    console.warn("SKIPPED", path.join("/"));
  },
  failed(path: string[], er: Error): void {
    if (typeof process !== undefined) process.exitCode = 1;
    console.log("FAILED", path.join("/"));
    console.error([er.name, er.message].filter((w) => w).join(": "));
    if (er.stack) console.log(er.stack);
  },
};
