import { createInterface } from "readline";
import CONSTANTS from "./util/constants";
import ReplHandler from "./handlers/ReplHandler";
import builtins from "./util/builtins";

const completer = (line: string) => {
  // Get command names add spaces to the end of the command
  const completions = Object.keys(builtins).map((c) => `${c.toLowerCase()} `);
  // Find partial matches
  const hits = completions.filter((c) => c.startsWith(line.toLowerCase()));
  return [hits.length ? hits : completions, line];
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: CONSTANTS.PROMPT_PREFIX,
  completer,
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
