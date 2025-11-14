import type { OutputOperator } from "./types";

export default {
  PROMPT_PREFIX: "$ ",
};

export const OutputOperators: OutputOperator[] = [
  "1>",
  ">", // Rewrites file
  ">>", // Appends to file
];
