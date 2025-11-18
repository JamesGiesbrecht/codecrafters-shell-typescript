import readline from "readline";
import cp from "child_process";
import Parser from "../helpers/InputParser";
import FileHelper from "../helpers/FileHelper";
import builtins from "../util/builtins";
import type {
  BuiltinCommand,
  ParsedCommand,
  RedirectOperator,
} from "../util/types";
import { StdoutOperators, StderrOperators } from "../util/constants";

export default class ReplHandler {
  protected line: string;
  protected rl: readline.Interface;
  public parsedLine: ParsedCommand;

  constructor(line: string, rl: readline.Interface) {
    this.line = line;
    this.rl = rl;
    this.parsedLine = Parser.parseLine(line);
  }

  private executeBuiltinCommand(): boolean {
    const builtinCommand = builtins[this.parsedLine.command];
    if (!builtinCommand) return false;

    let output: string | null = null;
    let error: string | null = null;
    try {
      output = builtinCommand(this.parsedLine.args);
    } catch (err: any) {
      error = err.message;
    }
    this.handleRedirects(output, error);
    this.rl.prompt();
    return true;
  }

  private executeExternalCommand(): boolean {
    if (!FileHelper.findExecutableInPath(this.parsedLine.command)) return false;

    cp.execFile(
      this.parsedLine.command,
      this.parsedLine.args,
      (error, stdout, stderr) => {
        this.handleRedirects(stdout, stderr);
        this.rl.prompt();
      }
    );
    return true;
  }

  private getRedirectsByOperator(
    operators: RedirectOperator[]
  ): ParsedCommand["redirects"] {
    return this.parsedLine.redirects.filter((redirect) =>
      operators.includes(redirect.operator)
    );
  }

  private writeOutput(
    line: string | null,
    redirects: ParsedCommand["redirects"],
    writer: (msg: string) => void
  ) {
    if (redirects.length > 0) {
      redirects.forEach((redirect) => {
        FileHelper.writeFile(redirect.path, line?.trim() || "");
      });
    } else if (line) {
      writer(line.trim());
    }
  }

  protected writeStdout(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ) {
    this.writeOutput(line, redirects, console.log);
  }

  protected writeStdError(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ) {
    this.writeOutput(line, redirects, console.error);
  }

  protected handleRedirects(stdout: string | null, stderr: string | null) {
    const stdoutRedirects = this.getRedirectsByOperator(StdoutOperators);
    const stderrRedirects = this.getRedirectsByOperator(StderrOperators);
    this.writeStdout(stdout, stdoutRedirects);
    this.writeStdError(stderr, stderrRedirects);
  }

  public execute() {
    if (this.executeBuiltinCommand()) {
      return;
    }
    if (this.executeExternalCommand()) {
      return;
    }
    // Command not found
    this.writeStdout(`${this.parsedLine.command}: command not found`);
    this.rl.prompt();
  }
}
