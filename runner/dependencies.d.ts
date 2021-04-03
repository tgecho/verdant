/* This is a partial type roughly representing what we're actually using or
likely to use */
declare module "nyc" {
  export default class NYC {
    constructor(opts: {
      exclude?: string | string[];
      excludeAfterRemap?: boolean;
      include?: string | string[];
      reporter: string[];
      reportDir?: string;
      tempDir?: string;
      watermarks?: Partial<{
        statements: Watermark;
        functions: Watermark;
        branches: Watermark;
        lines: Watermark;
      }>;
    });
    report(): Promise<void>;
  }
}

declare module "@istanbuljs/schema/default-exclude" {
  type defaultExclude = string[];
  export default typeof defaultExclude;
}
