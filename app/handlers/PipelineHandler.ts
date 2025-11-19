import readline from "readline";
import cp, { ChildProcess } from "child_process";
import type ReplHandler from "./ReplHandler";
import { Readable } from "node:stream";
import type { ParsedCommand } from "../util/types";

export default class PipelineHandler {
  private repl: ReplHandler;

  constructor(repl: ReplHandler) {
    this.repl = repl;
  }

  public async handle(): Promise<void> {
    if (this.repl.pipes.length === 0) {
      this.repl.rl.prompt();
      return;
    }
    try {
      // Spawn the initial command
      let currentProcess = this.spawnCommand(this.repl.parsedLine);
      // Chain subsequent commands
      for (const pipe of this.repl.pipes) {
        const nextProcess = this.spawnCommand(
          pipe,
          currentProcess.stdout || undefined
        );
        currentProcess = nextProcess;
      }

      // Handle final output
      currentProcess.stdout?.on("data", (data) => {
        this.repl.writeStdout(data.toString());
      });

      currentProcess.stderr?.on("data", (data) => {
        this.repl.writeStdError(data.toString());
      });

      currentProcess.on("close", () => {
        this.repl.rl.prompt();
      });
    } catch (error: any) {
      this.repl.writeStdError(error.message);
      this.repl.rl.prompt();
    }
  }

  private spawnCommand(
    cmd: ParsedCommand,
    stdin?: NodeJS.ReadableStream
  ): ChildProcess {
    const isFirst = !stdin;
    // first command should inherit stdin from terminal; piped commands use 'pipe' for stdin
    const stdio: Array<any> = isFirst
      ? ["inherit", "pipe", "pipe"]
      : ["pipe", "pipe", "pipe"];
    const child = cp.spawn(cmd.command, cmd.args, { stdio });
    if (stdin && child.stdin) {
      stdin.pipe(child.stdin);
    }
    return child;
  }
}
