# Verdant

A fast, opinionated test runner for Typescript/Javascript and co.

There are many like it, but this one is mine.

Open source, but not particularly looking to make an open project. This is custom made to fit my workflow and needs.

## Install

```sh
$ pnpm install @tgecho/verdant
```

## Usage

```sh
$ verdant             # just run once
$ verdant --coverage  # print coverage information (powered by nyc)
$ verdant --watch     # will only run tests affected by each detected file change
$ verdant --verbose   # print detailed output
$ verdant --bundle    # bundle the test suite into ./build/test.cjs (suitable for running directly with node)
```

An HTML coverage report will be output to `reports/coverage/index.html`. The rest of the default config can be found in [runner/main.ts](./runner/main.ts). I should probably spin that out into a customizable config file some day...

## Interesting characteristics, priorities, and accepted limitations

- Uses [esbuild](https://esbuild.github.io/) for really fast rebuilds
- Runs each test file in a fresh [worker thread](https://nodejs.org/api/worker_threads.html), but otherwise doesn't go through any pains to ensure a clean environment between tests.
  - Leaky tests are bad tests, and I don't want to slow things down to allow them to continue.
- Uses esbuild's bundling metadata to precisely calculate the dependencies of each test.
  - Allows us to only run affected tests when one or more file changes are detected.
  - Does not take into account `node_modules` changes without a reload.
- Shows a hollow/green/red dot (using [anydot](https://github.com/tonsky/AnyBar)) when in watch mode depending on whether the test suite is running/passed/failed.
