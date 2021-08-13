import { raw } from "../reporters/raw";
import { dots } from "../reporters/dots";
import { runner } from "./runner";
import { bundleAllTests } from "./bundleAllTests";
import { Config } from "./types";

const args = process.argv;
const watch = args.includes("--watch") || args.includes("-w");
const anybar = watch || args.includes("--anybar");
const verbose = args.includes("--verbose");
const bundle = args.includes("--bundle");
const coverage = watch || args.includes("--coverage");

const config: Config = {
  cwd: process.cwd(),
  paths: ["src", "tests"],
  tests: ["*.test.ts", "*.test.tsx", "*.test.js", "*.test.jsx"],
  ignored: [],
  reporters: ["text", "html"],
  watch,
  coverage,
  tmpDir: "./node_modules/.verdant_tmp",
  coverageReportDir: "./reports/coverage",
  bundlePath: "./build/test.cjs",
};

function main() {
  if (bundle) {
    bundleAllTests(config);
    return;
  }

  if (verbose) {
    runner(config, raw());
  } else {
    runner(config, dots({ clear: watch, anybar }));
  }
}
main();
