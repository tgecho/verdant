import minimatch from "minimatch";

export function makeMultiMatcher(patterns: string[]) {
  const testMatchers = patterns.map(
    (p) => new minimatch.Minimatch(p, { matchBase: true })
  );
  return function match(path: string) {
    for (const matcher of testMatchers) {
      if (matcher.match(path)) return true;
    }
    return false;
  };
}
