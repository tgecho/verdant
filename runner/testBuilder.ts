import { build, BuildIncremental, Plugin } from "esbuild";

export const makeAllPackagesExternalPlugin: Plugin = {
  name: "make-all-packages-external",
  setup(build) {
    const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};
export type TestBuilder = {
  bundle?: string;
  inputs: string[];
  build: () => Promise<TestBuilder>;
};
export function testBuilder(testPath: string): TestBuilder {
  let initial: BuildIncremental | undefined;

  function save(build: BuildIncremental) {
    builder.inputs = Object.keys(build.metafile?.inputs ?? {});
    builder.bundle = Object.keys(build.metafile?.outputs ?? {}).find((o) =>
      o.endsWith("js")
    );
  }

  const builder: TestBuilder = {
    inputs: [],
    async build() {
      if (initial) {
        save(await initial.rebuild());
      } else {
        initial = await build({
          entryPoints: [testPath],
          incremental: true,
          bundle: true,
          metafile: true,
          outdir: "./build/tests",
          sourcemap: true,
          outExtension: { ".js": ".cjs" },
          plugins: [makeAllPackagesExternalPlugin],
        });
        save(initial);
      }

      return builder;
    },
  };
  return builder;
}
