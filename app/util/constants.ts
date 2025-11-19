import type { RedirectOperator } from "./types";

export default {
  PROMPT_PREFIX: "$ ",
  PIPE: "|",
};

export const StdoutOperators: RedirectOperator[] = [
  ">", // Redirects stdout to file
  "1>", // Redirects stdout to file
  "1>>", // Appends stdout to file
  ">>", // Appends stdout to file
];

export const StderrOperators: RedirectOperator[] = [
  "2>", // Redirects stderr to file
  "2>>", // Appends stderr to file
];

export const RedirectOperators: RedirectOperator[] =
  StderrOperators.concat(StdoutOperators);
