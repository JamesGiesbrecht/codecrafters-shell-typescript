import path from "path";
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
  pwd,
  type,
  // xyz_foo,
  // xyz_foo_bar,
  // xyz_foo_bar_baz,
};

export default builtins;
