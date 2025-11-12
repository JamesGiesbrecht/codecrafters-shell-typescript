import { findExecutableInPath } from "./utils";

type BuiltinCommand = (args: string[]) => void;

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
      console.log(`${command}: not found`);
    }
  }
}

/**
 * Prints the current working directory
 *
 * @param {string[]} args
 */
function pwd(args: string[]): void {
  console.log(process.cwd());
}

const builtins: Record<string, BuiltinCommand> = {
  exit,
  echo,
  type,
  pwd,
};

export default builtins;
