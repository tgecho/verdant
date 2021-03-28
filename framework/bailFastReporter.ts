export const bailFastReporter = {
  started(): void {
    // don't care
  },
  passed(): void {
    // don't care
  },
  skipped(): void {
    // don't care
  },
  failed(_path: string[], error: Error): void {
    console.error(error);
    process.exit(1);
  },
};
