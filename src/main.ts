import { raw } from "./reporters/raw.js";
import { dots } from "./reporters/dots.js";
import { runner } from "./runner.js";

const args = process.argv;
const watch = args.includes("--watch") || args.includes("-w");
const anybar = watch || args.includes("--anybar");
const rawOutput = args.includes("--raw");

const config = {
  cwd: process.cwd(),
  paths: ["src", "tests"],
  tests: ["*.test.ts"],
  ignored: [],
  watch,
};

if (rawOutput) {
  runner(config, raw());
} else {
  runner(config, dots({ clear: watch, anybar }));
}
