import { createInterface } from "readline";
import builtins from "./builtins";

// Create interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const parseInput = function (input: string): {
  command: string;
  args: string[];
} {
  const tokens = input.trim().split(/\s+/);
  const command = tokens[0];
  const args = tokens.slice(1);
  return { command, args };
};

const executeInput = function (input: string): void {
  const { command, args } = parseInput(input);
  const builtinCommand = builtins[command];
  if (builtinCommand) {
    builtinCommand(args);
  } else {
    console.log(`${command}: command not found`);
  }
};

const main = () => {
  // Start prompt
  rl.prompt();

  // Handle input lines
  rl.on("line", (command) => {
    executeInput(command);
    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
};

main();
