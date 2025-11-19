export function beepSignal(): void {
  process.stdout.write("\u0007");
}

export function getLongestCommonPrefix(words: string[]): string {
  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    return words[0];
  }

  const sortedWords = words.sort((a, b) => a.length - b.length);
  const shortestWord = sortedWords[0];
  let result = "";

  for (let i = 0; i < shortestWord.length; i++) {
    const currentChar = shortestWord[i];
    let allMatch = true;

    // Check if all words have the same character at position i
    for (let j = 1; j < sortedWords.length; j++) {
      if (sortedWords[j][i] !== currentChar) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      result += currentChar;
    } else {
      break;
    }
  }

  return result;
}

export function splitArrayOn(arr: string[], delimiter: string): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  arr.forEach((word) => {
    if (word === delimiter) {
      out.push(current);
      current = [];
    } else {
      current.push(word);
    }
  });
  if (current.length > 0) {
    out.push(current);
  }
  return out;
}
