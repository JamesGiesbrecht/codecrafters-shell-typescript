import fs from "fs";
import path from "path";

type BuiltinCommand = (...args: any[]) => void;

const builtins: Record<string, BuiltinCommand> = {
  exit: (args: string[]) => {
    const exitCode = args.length > 0 ? parseInt(args[0], 10) : 0;
    process.exit(exitCode);
  },
  echo: (args: string[]) => {
    console.log(args.join(" "));
  },
  type: (args: string[]) => {
    const command = args[0];
    if (builtins[command]) {
      console.log(`${command} is a shell builtin`);
    } else {
      const pathDirs = (process.env.PATH || "").split(path.delimiter);
      let found = false;
      // Check each directory in PATH for the executable
      for (const dir of pathDirs) {
        const fullPath = path.join(dir, command);
        // Check if the file exists and is executable
        const fileExists = fs.existsSync(fullPath);
        let canExecute = true;
        try {
          fs.accessSync(fullPath, fs.constants.X_OK);
        } catch (err) {
          canExecute = false;
        }
        if (fileExists && canExecute) {
          // Found the executable
          console.log(`${command} is ${fullPath}`);
          found = true;
          break;
        }
      }
      // If not found in builtins or PATH
      if (!found) {
        console.log(`${command}: not found`);
      }
    }
  },
};

export default builtins;
