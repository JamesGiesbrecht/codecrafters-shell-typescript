import { createInterface } from "readline";
import CONSTANTS from "./util/constants";
import ReplHandler from "./handlers/ReplHandler";
import FileHelper from "./helpers/FileHelper";
import builtins from "./util/builtins";
import { beepSignal, getLongestCommonPrefix } from "./util/utils";

const repl = function () {
  const repl = new ReplHandler();
  repl.rl.prompt();

  repl.rl.on("line", (command) => {
    repl.setLine(command);
    if (!repl.parsedLine.command) {
      // No input
      repl.rl.prompt();
      return;
    }
    repl.execute();
  });
};

repl();
