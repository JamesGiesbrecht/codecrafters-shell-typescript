import { createInterface } from "readline";
import { execSync } from "child_process";
import Parser from "./InputParser";
import { findExecutableInPath } from "./utils";
import builtins from "./builtins";
import CONSTANTS from "./constants";

// TODO
// Create class to handle the inout
// Class should save the stdout to an internal buffer so we can write it or redirect it to a file

// Create interface
export const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repl = function () {
  rl.question(CONSTANTS.PROMPT_PREFIX, (fullCommand) => {
    const { command, args, redirects } = Parser.parseLine(fullCommand);
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
