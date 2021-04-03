import { ReportedError } from "../reporters/types";

export type Config = {
  cwd: string;
  paths: string[];
  tests: string[];
  ignored: string[];
  watch: boolean;
  coverage: true;
  tmpDir: string;
  coverageReportDir: string;
  bundlePath: string;
};

export type TestMsg =
  | { type: "started" | "passed" | "skipped"; path: string[] }
  | {
      type: "failed";
      path: string[];
      error: ReportedError;
    };

export type Log = { std: "out" | "err"; data: Buffer };

export type TestResult = {
  passed: boolean;
  logs: Log[];
  covDir?: string;
};

export type CoverageTask = {
  testPath: string;
  covDir: string;
};
