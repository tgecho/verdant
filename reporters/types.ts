import { Log } from "../runner/types";

export type ReportedError = { message: string; stack?: string };

export type Reporter = {
  queued?: (files: string[]) => void;
  started?: (path: string[]) => void;
  passed?: (path: string[]) => void;
  skipped?: (path: string[]) => void;
  failed?: (path: string[], error: ReportedError) => void;
  logs?: (path: string[], logs: Log[]) => void;
  done?: () => void;
};
