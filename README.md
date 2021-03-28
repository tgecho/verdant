# Verdant

A fast, opinionated test runner for Typescript/Javascript and co.

Open source, but not particularly looking to make an open project. This is custom made to fit my workflow and needs.

## Interesting characteristics, priorities, and accepted limitations

- Uses [esbuild](https://esbuild.github.io/) for really fast rebuilds
- Runs each test file in a fresh [worker thread](https://nodejs.org/api/worker_threads.html), but otherwise doesn't go through many pains to ensure a clean environment between tests.
  - Leaky tests are bad tests, and I don't want to slow things down to allow them to continue.
- Uses esbuild's bundling metadata to precisely calculate the dependencies of each test.
  - Allows us to only run affected tests when one or more file changes are detected.
  - Does not take into account `node_modules` changes without a reload.
