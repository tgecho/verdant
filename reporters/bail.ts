import { Reporter, ReportedError } from "./types";

export const bailReporter: Reporter = {
  started(): void {
    // don't care
  },
  passed(): void {
    // don't care
  },
  skipped(): void {
    // don't care
  },
  failed(path: string[], error: ReportedError): void {
    console.error(`Failed: ${path.join(" | ")}`);
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  },
};
