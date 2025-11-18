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

/**
 * Handles the Read-Eval-Print Loop (REPL) for shell command execution.
 * Manages parsing, execution, and output redirection of shell commands.
 */
export default class ReplHandler {
  protected line: string;
  protected rl: readline.Interface;
  public parsedLine: ParsedCommand;

  /**
   * Creates a new ReplHandler instance.
   * @param {string} line - The input command line to parse and execute
   * @param {readline.Interface} rl - The readline interface for prompt management
   */
  constructor(line: string, rl: readline.Interface) {
    this.line = line;
    this.rl = rl;
    this.parsedLine = Parser.parseLine(line);
  }

  /**
   * Executes a built-in shell command.
   * @private
   * @returns {boolean} True if a built-in command was found and executed, false otherwise
   */
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

  /**
   * Executes an external command found in the system PATH.
   * @private
   * @returns {boolean} True if an executable was found and executed, false otherwise
   */
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

  /**
   * Filters redirects by the specified operators.
   * @private
   * @param {RedirectOperator[]} operators - The operators to filter by
   * @returns {ParsedCommand["redirects"]} Array of redirects matching the operators
   */
  private getRedirectsByOperator(
    operators: RedirectOperator[]
  ): ParsedCommand["redirects"] {
    return this.parsedLine.redirects.filter((redirect) =>
      operators.includes(redirect.operator)
    );
  }

  /**
   * Writes output to either files (if redirects exist) or to the console.
   * @private
   * @param {string | null} line - The output line to write
   * @param {ParsedCommand["redirects"]} redirects - Array of redirect targets
   * @param {Function} writer - The callback function to write to console
   */
  private writeOutput(
    line: string | null,
    redirects: ParsedCommand["redirects"],
    writer: (msg: string) => void
  ) {
    if (redirects.length > 0) {
      redirects.forEach((redirect) => {
        const shouldAppend = redirect.operator.includes(">>");
        FileHelper.writeFile(redirect.path, line?.trim() || "", shouldAppend);
      });
    } else if (line) {
      writer(line.trim());
    }
  }

  /**
   * Writes standard output to console or redirects to file(s).
   * @protected
   * @param {string | null} line - The output line to write
   * @param {ParsedCommand["redirects"]} [redirects=[]] - Optional redirect targets
   */
  protected writeStdout(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ) {
    this.writeOutput(line, redirects, console.log);
  }

  /**
   * Writes standard error to console or redirects to file(s).
   * @protected
   * @param {string | null} line - The error line to write
   * @param {ParsedCommand["redirects"]} [redirects=[]] - Optional redirect targets
   */
  protected writeStdError(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ) {
    this.writeOutput(line, redirects, console.error);
  }

  /**
   * Handles output redirection for stdout and stderr.
   * @protected
   * @param {string | null} stdout - Standard output content
   * @param {string | null} stderr - Standard error content
   */
  protected handleRedirects(stdout: string | null, stderr: string | null) {
    const stdoutRedirects = this.getRedirectsByOperator(StdoutOperators);
    const stderrRedirects = this.getRedirectsByOperator(StderrOperators);
    this.writeStdout(stdout, stdoutRedirects);
    this.writeStdError(stderr, stderrRedirects);
  }

  /**
   * Executes the parsed command line.
   * Attempts execution as a built-in command first, then as an external command.
   * @public
   */
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
