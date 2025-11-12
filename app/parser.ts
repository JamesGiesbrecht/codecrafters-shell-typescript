class CommandParser {
  constructor() {}

  parse(input: string): string {
    return this.tokenize(input).join(" ");
  }

  tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    // Handle one character at a time
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (this._isEscape(char)) {
        // If the escape character is encountered, force the next character onto the array
        current += input[++i];
      } else if (this._isWhitespace(char)) {
        // If there is whitespace stop and push current onto the array
        if (current.length > 0) {
          // Ignore duplicated whitespaces (current having no value)
          tokens.push(current);
          current = "";
        }
      } else if (this._isQuote(char)) {
        // Read ahead on the quoted text and advance the index to match
        const { value, endIndex } = this._readQuotedSection(input, char, i);
        current += value;
        i = endIndex;
      } else {
        // Standard character
        current += char;
      }
    }
    if (current.length > 0) {
      tokens.push(current);
    }
    return tokens;
  }

  private _readQuotedSection(
    input: string,
    quoteChar: string,
    startIndex: number
  ): { value: string; endIndex: number } {
    let value = "";
    let endIndex = startIndex;
    // Skip the initial quote
    if (input[startIndex] === quoteChar) {
      startIndex++;
    }
    // Read until we find the closing quote, matching quoteChar
    for (let i = startIndex; i < input.length; i++) {
      const char = input[i];
      if (char === quoteChar) {
        // Found closing quote, Omit it from the result and return
        endIndex = i;
        break;
      } else {
        value += char;
      }
    }
    return { value, endIndex };
  }

  private _isQuote(char: string): boolean {
    return char === '"' || char === "'";
  }

  private _isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private _isEscape(char: string): boolean {
    return char === "\\";
  }
}

const commandParser = new CommandParser();

export default commandParser;
