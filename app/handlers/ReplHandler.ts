import readline from "readline";
import cp from "child_process";
import Parser from "../helpers/InputParser";
import FileHelper from "../helpers/FileHelper";
import builtins from "../util/builtins";
import type { ParsedCommand } from "../util/types";

export default class ReplHandler {
  protected line: string;
  protected rl: readline.Interface;
  public parsedLine: ParsedCommand;
  protected formattedCommand: string;

  constructor(line: string, rl: readline.Interface) {
    this.line = line;
    this.rl = rl;
    this.parsedLine = Parser.parseLine(line);
    const { command, args } = this.parsedLine;
    this.formattedCommand = [command, ...args].join(" ");
  }

  protected writeStdout(line: string | null) {
    if (line) {
      if (this.parsedLine.redirects.length > 0) {
        // Write to redirect file(s)
        this.parsedLine.redirects.forEach((redirect) => {
          FileHelper.writeFile(redirect.path, line);
        });
      } else {
        // Write to console
        console.log(line);
      }
    }
  }

  protected writeStdError(line: string) {
    console.error(line);
  }

  public execute() {
    const builtinCommand = builtins[this.parsedLine.command];
    if (builtinCommand) {
      // Built-in command
      this.writeStdout(builtinCommand(this.parsedLine.args));
      this.rl.prompt();
      return;
    }
    if (FileHelper.findExecutableInPath(this.parsedLine.command)) {
      // Executable found
      cp.execFile(
        this.parsedLine.command,
        this.parsedLine.args,
        (error, stdout, stderr) => {
          if (stdout) {
            this.writeStdout(stdout.trim());
          }
          if (stderr) {
            this.writeStdError(stderr.trim());
          }
          this.rl.prompt();
        }
      );
      return;
    }
    // Command not found
    this.writeStdout(`${this.parsedLine.command}: command not found`);
    this.rl.prompt();
  }
}
