export type Config = {
  cwd: string;
  paths: string[];
  tests: string[];
  ignored: string[];
  watch: boolean;
};

export type Callbacks = {
  queued?: (files: string[]) => void;
  started?: (file: string, path: string[]) => void;
  passed?: (file: string, path: string[]) => void;
  skipped?: (file: string, path: string[]) => void;
  failed?: (
    file: string,
    path: string[],
    error: { message: string; stack: string }
  ) => void;
  logs?: (file: string, logs: Log[]) => void;
  done?: () => void;
};

export type TestMsg =
  | { type: "started" | "passed" | "skipped"; path: string[] }
  | {
      type: "failed";
      path: string[];
      error: { message: string; stack: string };
    };

export type Log = { std: "out" | "err"; data: Buffer };

export type TestResult = {
  passed: boolean;
  logs: Log[];
};
