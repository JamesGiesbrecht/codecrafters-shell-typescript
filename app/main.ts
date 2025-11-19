import ReplHandler from "./handlers/ReplHandler";

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
