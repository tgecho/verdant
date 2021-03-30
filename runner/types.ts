import { ReportedError } from "../reporters/types";

export type Config = {
  cwd: string;
  paths: string[];
  tests: string[];
  ignored: string[];
  watch: boolean;
  tmpDir: string;
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
};
