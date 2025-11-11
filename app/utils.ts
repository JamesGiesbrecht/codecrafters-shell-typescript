import fs from "fs";
import path from "path";

const parseInput = function (input: string): {
  command: string;
  args: string[];
} {
  const tokens = input.trim().split(/\s+/);
  const command = tokens[0];
  const args = tokens.slice(1);
  return { command, args };
};

const isExecutable = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const findExecutableInPath = (command: string): string | null => {
  const pathDirs = (process.env.PATH || "").split(path.delimiter);
  // Check each directory in PATH for the executable
  for (const dir of pathDirs) {
    const fullPath = path.join(dir, command);
    if (fs.existsSync(fullPath) && isExecutable(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

export { parseInput, findExecutableInPath };
