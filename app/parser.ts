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
      } else if (Boolean(this._isQuote(char))) {
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
      if (this._isEscape(char) && this._isQuote(quoteChar) === 2) {
        // Handle escape characters for strings that are double quoted
        const escapableCharacters = ['"', "\\", "$", "`", "\n"];
        const escapedChar = input[i + 1];
        if (escapableCharacters.includes(escapedChar)) {
          value += escapedChar;
          i++;
        } else {
          // If character is not escapable, print the backslash
          value += char;
        }
      } else if (char === quoteChar) {
        // Found closing quote, Omit it from the result and return
        endIndex = i;
        break;
      } else {
        value += char;
      }
    }
    return { value, endIndex };
  }

  /**
   *
   * @param char character to determine if it is a quote or not
   * @returns 1 if it is a quote, 2 if it is a double quote, 0 if it is not a quote
   * Can be evaluated to a truthy value with Boolean()
   */
  private _isQuote(char: string): number {
    switch (char) {
      case "'":
        return 1;
      case '"':
        return 2;
      default:
        return 0;
    }
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
