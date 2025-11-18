import { createInterface } from "readline";
import CONSTANTS from "./util/constants";
import ReplHandler from "./handlers/ReplHandler";
import FileHelper from "./helpers/FileHelper";
import builtins from "./util/builtins";
import { getLongestCommonPrefix } from "./util/completer";

const beepSignal = () => {
  process.stdout.write("\u0007");
};

const repl = function () {
  let tabCounter = 0;
  const resetState = () => {
    tabCounter = 0;
  };

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
        resetState();
        return [completions, line];
      }

      // Return the first hit
      if (hits.length === 1) {
        resetState();
        return [hits, line];
      }

      // If there are multiple matches
      if (hits.length > 1) {
        const lcp = getLongestCommonPrefix(hits);

        if (lcp && lcp !== line) {
          // There's a common prefix to complete to
          resetState();
          return [[lcp.trim()], line];
        } else if (tabCounter === 0) {
          // First tab: beep, don't complete
          tabCounter += 1;
          beepSignal();
          return [[], line];
        } else {
          // Second tab: show all options, keep line unchanged
          process.stdout.write(
            `\n${hits.join(" ")}\n${CONSTANTS.PROMPT_PREFIX}${line}`
          );
          resetState();
          return [[], line];
        }
      }

      resetState();
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
