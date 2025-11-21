import fs from "fs";
import path from "path";

export default class FileHelper {
  public static getExecutablesInPath(): string[] {
    const pathDirs = (process.env.PATH || "").split(path.delimiter);
    const executables: string[] = [];
    pathDirs.forEach((p) => {
      try {
        fs.readdirSync(p)
          .filter((file) => {
            return FileHelper.isExecutable(path.join(p, file));
          })
          .forEach((file) => {
            executables.push(file);
          });
      } catch {
        return;
      }
    });
    return executables;
  }

  public static isExecutable(filePath: string): boolean {
    try {
      fs.accessSync(filePath, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  public static findExecutableInPath(command: string): string | null {
    const pathDirs = (process.env.PATH || "").split(path.delimiter);
    // Check each directory in PATH for the executable
    for (const dir of pathDirs) {
      const fullPath = path.join(dir, command);
      if (fs.existsSync(fullPath) && this.isExecutable(fullPath)) {
        return fullPath;
      }
    }
    return null;
  }

  public static writeFile(
    filePath: string,
    content: string,
    shouldAppend: boolean = false
  ): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (content) {
      content += "\n";
    }
    if (shouldAppend) {
      fs.appendFileSync(filePath, content, { encoding: "utf8" });
    } else {
      fs.writeFileSync(filePath, content, { encoding: "utf8" });
    }
  }

  public static readFile(filePath: string): string {
    return fs.readFileSync(filePath, { encoding: "utf8" });
  }

  public static readHistory(filePath: string): string[] {
    return fs.readFileSync(filePath, { encoding: "utf8" }).trim().split("\n");
  }
}
