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
  failed(_path: string[], error: ReportedError): void {
    console.error(error);
    process.exit(1);
  },
};
