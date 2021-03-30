import chalk from "chalk";
import { anybar } from "./anybar";
import { Reporter } from "./types";

const write = process.stdout.write.bind(process.stdout);
// const write = console.log;

function printPath(path: string[]) {
  return path.join(" | ");
}

export function dots(options?: { clear: boolean; anybar: boolean }): Reporter {
  const clear = options?.clear ?? true;

  const dot = options?.anybar ? anybar() : null;

  let stats: { total: number; passed: number; skipped: number; failed: number };
  return {
    queued(files) {
      stats = { total: 0, passed: 0, skipped: 0, failed: 0 };
      if (clear) console.clear();
      write(chalk.dim(`\nRUNNING ${files.join(", ")}\n\n`));
      dot?.set("hollow");
    },
    started() {
      stats.total += 1;
    },
    passed() {
      stats.passed += 1;
      write(chalk.green("."));
    },
    skipped() {
      stats.skipped += 1;
      write(chalk.yellow("s"));
    },
    failed(path, error) {
      stats.failed += 1;
      write(chalk.red(`\n\nFAILED ${printPath(path)})\n`));
      write(`${error.message}\n`);
      write(`${error.stack}\n`);
      dot?.set("red");
    },
    logs(path, logs) {
      if (logs.length > 0) {
        const pathStr = printPath(path);
        write(chalk.dim(`\n\nLOGS ${pathStr}\n\n`));
        for (const line of logs) {
          const text = line.data.toString();
          write(line.std === "err" ? chalk.red(text) : text);
        }
        write(chalk.dim(`\nend LOGS ${pathStr}\n`));
      }
    },
    done() {
      if (stats.failed === 0) {
        write(chalk.green(`\n\n${stats.passed}/${stats.total} passed`));
        dot?.set("green");
      } else {
        write(chalk.red(`\n\n${stats.passed}/${stats.total} passed`));
      }
      if (stats.failed) write(" / " + chalk.red(`${stats.failed} failed`));
      if (stats.skipped)
        write(" / " + chalk.yellow(`${stats.skipped} skipped`));
      write("\n");
    },
  };
}
