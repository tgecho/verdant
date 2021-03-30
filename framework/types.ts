export type HookFn = (<T>(make: (cleanup: CleanupFn) => T) => T) & {
  cleanup: CleanupFn;
};
export type CleanupFn = (cleanup: () => void) => void;
