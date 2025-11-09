import { createInterface } from "readline";

// Create interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ ",
});

const executeCommand = (command: string) => {
  console.log(`${command}: command not found`);
};

const main = () => {
  // Start prompt
  rl.prompt();

  // Handle input lines
  rl.on("line", (command) => {
    executeCommand(command);
    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
};

main();
