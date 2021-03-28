import chalk from "chalk";
import { anybar } from "./anybar.js";
import { Callbacks } from "../types.js";

const write = process.stdout.write.bind(process.stdout);
// const write = console.log;

export function dots(options?: { clear: boolean; anybar: boolean }): Callbacks {
  const clear = options?.clear ?? true;

  const dot = options?.anybar ? anybar() : null;

  let stats: { total: number; passed: number; skipped: number; failed: number };
  return {
    queued(files) {
      stats = { total: 0, passed: 0, skipped: 0, failed: 0 };
      if (clear) console.clear();
      write(chalk.dim(`\nRUNNING ${files.join(", ")}\n\n`));
    },
    started() {
      stats.total += 1;
      dot?.set("hollow");
    },
    passed() {
      stats.passed += 1;
      write(chalk.green("."));
    },
    skipped() {
      stats.skipped += 1;
      write(chalk.yellow("s"));
    },
    failed(file, path, error) {
      stats.failed += 1;
      write(chalk.red(`\n\nFAILED ${file} (${path.join(" | ")})\n`));
      write(`${error.message}\n`);
      write(`${error.stack}\n`);
      dot?.set("red");
    },
    logs(file, logs) {
      if (logs.length > 0) {
        write(chalk.dim(`\n\nLOGS ${file}\n`));
        for (const line of logs) {
          const text = line.data.toString();
          write(line.std === "err" ? chalk.red(text) : text);
        }
        write(chalk.dim(`\nend LOGS ${file}\n`));
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
