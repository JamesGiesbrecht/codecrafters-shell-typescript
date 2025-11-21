import path from "path";
import repl from "../handlers/ReplHandler";
import FileHelper from "../helpers/FileHelper";
import type { BuiltinCommand } from "./types";

/**
 * Changes the current working directory
 */
function cd(args: string[]) {
  const HOME_DIR = "~";
  const defaultDir = process.env.HOME || path.delimiter;
  // cd to arg, home directory, or root
  var dir = args[0] || defaultDir;
  if (dir === HOME_DIR) dir = defaultDir;
  try {
    process.chdir(dir);
    return null;
  } catch (err: any) {
    return `cd: ${dir}: No such file or directory`;
  }
}

/**
 * Writes arguments to standard output
 */
function echo(args: string[]): string {
  // handle -n (no trailing newline)
  if (args.length > 0 && args[0] === "-n") {
    return args.slice(1).join(" ");
  }
  return args.join(" ") + "\n";
}

/**
 * Exits the shell with the given exit code
 */
function exit(args: string[]) {
  const exitCode = args.length > 0 ? parseInt(args[0], 10) : 0;
  process.exit(exitCode);
  return null;
}

/**
 * Prints the current history
 */
function history(args: string[]): string {
  let limit = repl.history.length;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argNum = parseInt(arg, 10);
    if (!isNaN(argNum)) {
      limit = argNum;
    } else if (args[i + 1]) {
      const filePath = args[i + 1];
      switch (arg) {
        case "-r":
          // Read file contents to history, do not print anything
          repl.history.push(...FileHelper.readHistory(filePath));
          break;
        case "-w":
          // Write current history to file
          FileHelper.writeFile(filePath, repl.history.join("\n"));
          break;
        case "-a":
          const indexOfLastAppend = repl.history
            .toSpliced(-1, 1)
            .findLastIndex((item) => item.startsWith("history -a"));
          const startIndex =
            indexOfLastAppend === -1 ? 0 : indexOfLastAppend + 1;
          // Append current history to file
          FileHelper.writeFile(
            filePath,
            repl.history.slice(startIndex).join("\n"),
            "append"
          );
          break;
        default:
      }
      return "";
    }
  }
  // Build and number history
  let out = "";
  for (let i = repl.history.length - limit; i < repl.history.length; i++) {
    out += `${i + 1} ${repl.history[i]}\n`;
  }
  return out;
}

/**
 * Prints the current working directory
 */
function pwd(args: string[]): string {
  return process.cwd();
}

/**
 * Displays whether a command is a shell builtin or an external executable
 */
function type(args: string[]): string {
  const command = args[0];
  if (builtins[command]) {
    return `${command} is a shell builtin`;
  } else {
    const executablePath = FileHelper.findExecutableInPath(command);
    if (executablePath) {
      return `${command} is ${executablePath}`;
    } else {
      return `${command}: not found`;
    }
  }
}

function xyz_foo(args: string[]): string {
  return `xyz_foo`;
}

function xyz_foo_bar(args: string[]): string {
  return `xyz_foo_bar`;
}

function xyz_foo_bar_baz(args: string[]): string {
  return `xyz_foo_bar_baz`;
}

const builtins: Record<string, BuiltinCommand> = {
  cd,
  echo,
  exit,
  history,
  pwd,
  type,
  // xyz_foo,
  // xyz_foo_bar,
  // xyz_foo_bar_baz,
};

export default builtins;
