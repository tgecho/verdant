export type HookFn = (<T>(make: (cleanup: CleanupFn) => T) => T) & {
  cleanup: CleanupFn;
};
export type CleanupFn = (cleanup: () => void) => void;
export type Report = {
  started(path: string[]): void;
  passed(path: string[]): void;
  skipped(path: string[]): void;
  failed(path: string[], error: { message: string; stack?: string }): void;
};
