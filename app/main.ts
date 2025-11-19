import repl from "./handlers/ReplHandler";

const replLoop = function () {
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

replLoop();
