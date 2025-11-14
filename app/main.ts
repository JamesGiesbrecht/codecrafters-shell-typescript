import { createInterface } from "readline";
import CONSTANTS from "./util/constants";
import ReplHandler from "./handlers/ReplHandler";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: CONSTANTS.PROMPT_PREFIX,
});

const repl = function () {
  rl.prompt();

  rl.on("line", (fullCommand) => {
    const replHandler = new ReplHandler(fullCommand, rl);
    if (!replHandler.parsedLine.command) {
      // No input
      rl.prompt();
      return;
    }
    replHandler.execute();
  });
};

repl();
