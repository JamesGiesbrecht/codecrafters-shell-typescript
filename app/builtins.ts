import path from "path";
import { findExecutableInPath } from "./utils";
import type { BuiltinCommand } from "./types";

/**
 * Changes the current working directory
 */
function cd(args: string[]): void {
  const HOME_DIR = "~";
  const defaultDir = process.env.HOME || path.delimiter;
  // cd to arg, home directory, or root
  var dir = args[0] || defaultDir;
  if (dir === HOME_DIR) dir = defaultDir;
  try {
    process.chdir(dir);
  } catch (err: any) {
    console.error(`cd: ${dir}: No such file or directory`);
  }
}

/**
 * Writes arguments to standard output
 */
function echo(args: string[]): void {
  console.log(args.join(" "));
}

/**
 * Exits the shell with the given exit code
 */
function exit(args: string[]): void {
  const exitCode = args.length > 0 ? parseInt(args[0], 10) : 0;
  process.exit(exitCode);
}

/**
 * Prints the current working directory
 */
function pwd(args: string[]): void {
  console.log(process.cwd());
}

/**
 * Displays whether a command is a shell builtin or an external executable
 */
function type(args: string[]): void {
  const command = args[0];
  if (builtins[command]) {
    console.log(`${command} is a shell builtin`);
  } else {
    const executablePath = findExecutableInPath(command);
    if (executablePath) {
      console.log(`${command} is ${executablePath}`);
    } else {
      console.error(`${command}: not found`);
    }
  }
}

const builtins: Record<string, BuiltinCommand> = {
  cd,
  echo,
  exit,
  pwd,
  type,
};

export default builtins;
