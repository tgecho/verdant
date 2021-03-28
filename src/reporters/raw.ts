import { Callbacks } from "../types.js";

export function raw(): Callbacks {
  return {
    queued(files) {
      console.clear();
      console.log("QUEUED", files);
    },
    started(test, path) {
      console.log("STARTED", test, path);
    },
    passed(test, path) {
      console.log("PASSED", test, path);
    },
    skipped(test, path) {
      console.log("SKIPPED", test, path);
    },
    failed(file, path, error) {
      console.log("FAILED", file, path, error);
    },
    logs(file, logs) {
      if (logs.length > 0) {
        console.log("LOGS", file, logs);
      }
    },
    done() {
      console.log("DONE");
    },
  };
}
