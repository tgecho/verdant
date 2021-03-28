import { raw } from "./reporters/raw.js";
import { dots } from "./reporters/dots.js";
import { runner } from "./runner.js";
import { bundleAllTests } from "./bundleAllTests.js";

const args = process.argv;
const watch = args.includes("--watch") || args.includes("-w");
const anybar = watch || args.includes("--anybar");
const rawOutput = args.includes("--raw");
const bundle = args.includes("--bundle");

const config = {
  cwd: process.cwd(),
  paths: ["src", "tests"],
  tests: ["*.test.ts"],
  ignored: [],
  watch,
  tmpDir: "./build/tests",
};

function main() {
  if (bundle) {
    bundleAllTests(config);
    return;
  }

  if (rawOutput) {
    runner(config, raw());
  } else {
    runner(config, dots({ clear: watch, anybar }));
  }
}
main();
