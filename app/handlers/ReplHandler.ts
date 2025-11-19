import readline, { type CompleterResult } from "readline";
import cp from "child_process";
import Parser from "../helpers/InputParser";
import FileHelper from "../helpers/FileHelper";
import builtins from "../util/builtins";
import type { ParsedCommand, RedirectOperator } from "../util/types";
import { StdoutOperators, StderrOperators } from "../util/constants";
import { beepSignal, getLongestCommonPrefix } from "../util/utils";
import CONSTANTS from "../util/constants";
import PipelineHandler from "./PipelineHandler";

/**
 * ReplHandler - Read / Eval / Print Loop for the shell.
 */
class ReplHandler {
  public line: string = "";
  public history: string[] = [];
  public rl: readline.Interface;
  public parsedLine: ParsedCommand;
  public pipes: ParsedCommand[] = [];
  private tabCounter: number = 0;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: CONSTANTS.PROMPT_PREFIX,
      completer: this.completer.bind(this),
    });
    this.parsedLine = Parser.parseLine(this.line)[0];
  }

  // ==================== Public API ====================

  /**
   * Updates the current line and re-parses it.
   * @param line - The new command line string
   */
  public setLine(line: string): void {
    this.line = line;
    this.history.push(line);
    const parsedCommands = Parser.parseLine(this.line);
    if (parsedCommands.length === 0) return;
    this.parsedLine = parsedCommands[0];
    this.pipes = parsedCommands.slice(1);
  }

  /**
   * Executes the parsed command line.
   * Attempts execution as a built-in command first, then as an external command.
   * Displays error message if command is not found.
   */
  public execute(): void {
    if (this.pipes.length > 0) {
      const pipelineHandler = new PipelineHandler();
      pipelineHandler.handle();
    } else {
      if (this.executeBuiltinCommand()) return;
      if (this.executeExternalCommand()) return;
      this.handleCommandNotFound();
    }
  }

  /**
   * Writes standard output to console or redirects to file(s).
   * @param line - The output line to write
   * @param redirects - Optional redirect targets
   */
  public writeStdout(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ): void {
    this.writeOutput(line, redirects, (s) => process.stdout.write(s));
  }

  /**
   * Writes standard error to console or redirects to file(s).
   * @param line - The error line to write
   * @param redirects - Optional redirect targets
   */
  public writeStdError(
    line: string | null,
    redirects: ParsedCommand["redirects"] = []
  ): void {
    this.writeOutput(line, redirects, (s) => process.stderr.write(s));
  }

  // ==================== Private: Command Execution ====================

  /**
   * Executes a built-in shell command.
   * @returns True if a built-in command was found and executed
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
   * @returns True if an executable was found and executed
   */
  private executeExternalCommand(): boolean {
    if (!FileHelper.findExecutableInPath(this.parsedLine.command)) return false;
    this.executeCommandAsync((cb) =>
      cp.execFile(this.parsedLine.command, this.parsedLine.args, cb)
    );
    return true;
  }

  /**
   * Executes an asynchronous command with callback.
   * @param fn - Function that accepts a callback for command execution
   */
  private executeCommandAsync(
    fn: (
      callback: (error: Error | null, stdout: string, stderr: string) => void
    ) => void
  ): void {
    fn((error, stdout, stderr) => {
      const errorOutput = error ? stderr || error.message : null;
      this.handleRedirects(stdout || null, errorOutput);
      this.rl.prompt();
    });
  }

  /**
   * Handles the case when a command is not found.
   */
  private handleCommandNotFound(): void {
    this.handleRedirects(`${this.parsedLine.command}: command not found`, null);
    this.rl.prompt();
  }

  // ==================== Private: Output Redirection ====================

  /**
   * Handles output redirection for stdout and stderr.
   * @param stdout - Standard output content
   * @param stderr - Standard error content
   */
  private handleRedirects(stdout: string | null, stderr: string | null): void {
    const stdoutRedirects = this.getRedirectsByOperator(StdoutOperators);
    const stderrRedirects = this.getRedirectsByOperator(StderrOperators);
    this.writeStdout(stdout, stdoutRedirects);
    this.writeStdError(stderr, stderrRedirects);
  }

  /**
   * Filters redirects by the specified operators.
   * @param operators - The operators to filter by (e.g., '>', '>>')
   * @returns Array of redirects matching the operators
   */
  private getRedirectsByOperator(
    operators: RedirectOperator[]
  ): ParsedCommand["redirects"] {
    return this.parsedLine.redirects.filter((redirect) =>
      operators.includes(redirect.operator)
    );
  }
  // ls -1 nonexistent 2>> tmp/cow/pig.md
  /**
   * Writes output to either files (if redirects exist) or to the console.
   * @param line - The output line to write
   * @param redirects - Array of redirect targets
   * @param writer - The callback function to write to console
   */
  private writeOutput(
    line: string | null,
    redirects: ParsedCommand["redirects"],
    writer: (msg: string) => void
  ): void {
    if (redirects.length > 0) {
      redirects.forEach((redirect) => {
        FileHelper.writeFile(
          redirect.path,
          line?.trim() || "",
          redirect.operator.includes(">>")
        );
      });
    } else if (line) {
      const out = line.endsWith("\n") ? line : `${line}\n`;
      writer(out);
    }
  }

  // ==================== Private: Tab Completion ====================

  /**
   * Resets the tab counter for command completion cycling.
   */
  private resetState(): void {
    this.tabCounter = 0;
  }

  /**
   * Provides tab completion for commands.
   * - First tab: completes to longest common prefix
   * - Second tab: shows all matching options
   * @param line - The current line being typed
   * @returns Tuple of [matches, original_line]
   */
  private completer(line: string): CompleterResult {
    const completions = Object.keys(builtins)
      .concat(FileHelper.getExecutablesInPath())
      .map((c) => `${c.toLowerCase()} `)
      .sort();

    const hits = Array.from(
      new Set(completions.filter((c) => c.startsWith(line.toLowerCase())))
    );

    // No matches
    if (hits.length === 0) {
      beepSignal();
      this.resetState();
      return [completions, line];
    }

    // Single match
    if (hits.length === 1) {
      this.resetState();
      return [hits, line];
    }

    // Multiple matches
    const lcp = getLongestCommonPrefix(hits);

    if (lcp && lcp !== line) {
      this.resetState();
      return [[lcp.trim()], line];
    }

    if (this.tabCounter === 0) {
      this.tabCounter += 1;
      beepSignal();
      return [[], line];
    }

    process.stdout.write(
      `\n${hits.join(" ")}\n${CONSTANTS.PROMPT_PREFIX}${line}`
    );
    this.resetState();
    return [[], line];
  }
}

export default new ReplHandler();
