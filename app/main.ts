import { createInterface } from "readline";
import CONSTANTS from "./util/constants";
import ReplHandler from "./handlers/ReplHandler";
import FileHelper from "./helpers/FileHelper";
import builtins from "./util/builtins";

const beepSignal = () => {
  process.stdout.write("\u0007");
};

const repl = function () {
  let tabCounter = 0;

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: CONSTANTS.PROMPT_PREFIX,
    completer: (line: string) => {
      // Get command names add spaces to the end of the command
      const completions = Object.keys(builtins)
        .concat(FileHelper.getExecutablesInPath())
        .map((c) => `${c.toLowerCase()} `)
        .sort();

      // Find partial matches
      const hits = Array.from(
        new Set(completions.filter((c) => c.startsWith(line.toLowerCase())))
      );
      if (hits.length === 0) {
        beepSignal();
        return [completions, line];
      }
      // Return the first hit
      if (hits.length === 1) {
        return [hits, line];
      }
      // If there are multiple matches, print them out and write the original line to the screen
      if (hits.length > 1) {
        if (tabCounter === 0) {
          tabCounter += 1;
          beepSignal();
        } else {
          process.stdout.write(
            `\n${hits.join(" ")}\n${CONSTANTS.PROMPT_PREFIX}${line}`
          );
          tabCounter = 0;
        }
        return [[], line];
      }
      return [hits, line];
    },
  });
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
