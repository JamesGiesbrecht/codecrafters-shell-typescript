import { createInterface } from "readline";
import { executeInput } from "./utils";

const PROMPT_PREFIX = "$ ";

// Create interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = () => {
  // Start prompt
  rl.question(PROMPT_PREFIX, (answer) => {
    executeInput(answer);
    main();
  });
};

main();
