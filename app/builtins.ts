type BuiltinCommand = (...args: any[]) => void;

const builtins: Record<string, BuiltinCommand> = {
  exit: (args: string[]) => {
    const exitCode = args.length > 0 ? parseInt(args[0], 10) : 0;
    process.exit(exitCode);
  },
  echo: (args: string[]) => {
    console.log(args.join(" "));
  },
};

export default builtins;
