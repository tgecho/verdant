import chokidar, { FSWatcher } from "chokidar";
import { Config } from "./types";

export function watch(
  config: Config,
  onCreateOrUpdate: (path: string) => void,
  onDelete: (path: string) => void
): Promise<FSWatcher> {
  const watcher = chokidar.watch(config.paths, {
    persistent: config.watch,
    ignored: config.ignored,
  });
  watcher.on("add", onCreateOrUpdate);
  watcher.on("change", onCreateOrUpdate);
  watcher.on("unlink", onDelete);
  watcher.on("error", console.error);
  return new Promise((resolve) => {
    watcher.on("ready", () => {
      resolve(watcher);
    });
  });
}
