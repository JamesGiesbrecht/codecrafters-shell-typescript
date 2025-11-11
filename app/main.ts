import { createInterface } from "readline";
import { execSync } from "child_process";
import { parseInput, findExecutableInPath } from "./utils";
import builtins from "./builtins";

const PROMPT_PREFIX = "$ ";

// Create interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repl = function () {
  rl.question(PROMPT_PREFIX, (fullCommand) => {
    const { command, args } = parseInput(fullCommand);
    if (!command) {
      // No input
      repl();
      return;
    }
    const builtinCommand = builtins[command];
    if (builtinCommand) {
      // Built-in command
      builtinCommand(args);
    } else if (findExecutableInPath(command)) {
      // External command
      execSync(fullCommand, { stdio: "inherit" });
    } else {
      // Command not found
      console.log(`${command}: command not found`);
    }
    repl();
  });
};

repl();
