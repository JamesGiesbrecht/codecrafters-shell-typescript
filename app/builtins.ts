import path from "path";
import { findExecutableInPath } from "./utils";

type BuiltinCommand = (args: string[]) => void;

/**
 * Changes the current working directory
 *
 * @param {string[]} args
 */
function cd(args: string[]): void {
  // cd to arg, home directory, or root
  const dir = args[0] || process.env.HOME || path.delimiter;
  try {
    process.chdir(dir);
  } catch (err: any) {
    console.error(`cd: ${dir}: No such file or directory`);
  }
}

/**
 * Writes arguments to standard output
 *
 * @param {string[]} args
 */
function echo(args: string[]): void {
  console.log(args.join(" "));
}

/**
 * Exits the shell with the given exit code
 *
 * @param {string[]} args
 */
function exit(args: string[]): void {
  const exitCode = args.length > 0 ? parseInt(args[0], 10) : 0;
  process.exit(exitCode);
}

/**
 * Prints the current working directory
 *
 * @param {string[]} args
 */
function pwd(args: string[]): void {
  console.log(process.cwd());
}

/**
 * Displays whether a command is a shell builtin or an external executable
 *
 * @param {string[]} args
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
