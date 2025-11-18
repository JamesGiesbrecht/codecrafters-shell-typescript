import fs from "fs";
import path from "path";

export default class FileHelper {
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
    const filename = path.basename(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (shouldAppend) {
      const fileContent = content ? `\n${content}` : "";
      fs.appendFileSync(filePath, fileContent, { encoding: "utf8" });
    } else {
      fs.writeFileSync(filePath, content, { encoding: "utf8" });
    }
  }
}
// ls -1 tmp/ant > tmp/cow/cow.md
