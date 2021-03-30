import { Reporter } from "./types";

export function raw(): Reporter {
  return {
    queued(files) {
      console.clear();
      console.log("QUEUED", files);
    },
    started(path) {
      console.log("STARTED", path);
    },
    passed(path) {
      console.log("PASSED", path);
    },
    skipped(path) {
      console.log("SKIPPED", path);
    },
    failed(path, error) {
      console.log("FAILED", path, error);
    },
    logs(path, logs) {
      if (logs.length > 0) {
        console.log("LOGS", path, logs);
      }
    },
    done() {
      console.log("DONE");
    },
  };
}
