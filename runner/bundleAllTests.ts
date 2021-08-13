import fs from "fs/promises";
import path from "path";

import { build, BuildResult } from "esbuild";
import { makeAllPackagesExternalPlugin } from "./testBuilder";
import { Config } from "./types";
import { watch } from "./watch";

const bailReporter = "@tgecho/verdant/bailReporter";

export async function bundleAllTests(config: Config): Promise<BuildResult> {
  const sources: string[] = [];
  await watch(
    { ...config, watch: false },
    (p) => sources.push(p),
    () => {
      /* noop */
    }
  );
  const bundleSource = sources
    .map((f) => `import "${path.relative(config.tmpDir, f)}";`)
    .join("\n");
  const bundleSourcePath = path.join(config.tmpDir, "bundle.ts");
  await fs.mkdir(config.tmpDir, { recursive: true });
  await fs.writeFile(bundleSourcePath, bundleSource);
  return build({
    entryPoints: [bundleSourcePath],
    bundle: true,
    outfile: config.bundlePath,
    sourcemap: true,
    platform: "node",
    plugins: [makeAllPackagesExternalPlugin],
    banner: {
      js: `__VERDANT_TEST_REPORTER = require("${bailReporter}").bailReporter;`,
    },
  });
}
