import cp, { ChildProcess } from "child_process";
import repl from "./ReplHandler";
import { PassThrough } from "stream";
import type { ParsedCommand } from "../util/types";
import builtins from "../util/builtins";

export default class PipelineHandler {
  constructor() {}

  public async handle(): Promise<void> {
    if (repl.pipes.length === 0) {
      repl.rl.prompt();
      return;
    }
    try {
      // Spawn the initial command
      let currentProcess = this.spawnCommand(repl.parsedLine);
      // Chain subsequent commands
      for (const pipe of repl.pipes) {
        const nextProcess = this.spawnCommand(
          pipe,
          currentProcess.stdout || undefined
        );
        currentProcess = nextProcess;
      }

      // Handle final output
      currentProcess.stdout?.on("data", (data) => {
        repl.writeStdout(data.toString());
      });

      currentProcess.stderr?.on("data", (data) => {
        repl.writeStdError(data.toString());
      });

      currentProcess.on("close", () => {
        repl.rl.prompt();
      });
    } catch (error: any) {
      repl.writeStdError(error.message);
      repl.rl.prompt();
    }
  }
  private spawnCommand(
    cmd: ParsedCommand,
    stdin?: NodeJS.ReadableStream
  ): ChildProcess {
    // If this command is a builtin, run it and
    // expose a "child-like" object with stdout/stderr streams so it can be
    // piped into other commands.
    const builtinFn = builtins[cmd.command];
    if (builtinFn) {
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const stdinPass = new PassThrough();

      const closeCallbacks: Array<() => void> = [];
      const childLike: any = {
        stdout,
        stderr,
        stdin: stdinPass,
        on: (ev: string, cb: (...args: any[]) => void) => {
          if (ev === "close") {
            closeCallbacks.push(() => cb(0));
          }
        },
      };

      const runBuiltin = (inputData?: string) => {
        // If input data is present, append it as an extra arg to the builtin.
        // (Builtins here accept only args: string[], this is a simple way to
        // pass piped data to builtins.)
        const args =
          inputData && inputData.length > 0
            ? cmd.args.concat([inputData])
            : cmd.args.slice();
        try {
          const result = builtinFn(args);
          if (result) {
            stdout.write(result);
          }
        } catch (err: any) {
          stderr.write(err?.message ?? String(err));
        } finally {
          // End streams and notify close listeners
          stdout.end();
          stderr.end();
          closeCallbacks.forEach((cb) => cb());
        }
      };

      if (stdin) {
        // If there's an incoming stream, collect it and pass into builtin when it ends.
        let collected = "";
        stdin.on("data", (chunk) => {
          collected += chunk.toString();
        });
        stdin.on("end", () => {
          runBuiltin(collected);
        });
        // Also pipe into our stdin pass-through for compatibility with other code.
        stdin.pipe(stdinPass);
      } else {
        // Run builtin asynchronously on next tick to mimic child process behavior.
        process.nextTick(() => runBuiltin());
      }

      return childLike as unknown as ChildProcess;
    }

    // Not a builtin: spawn a real child process
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
