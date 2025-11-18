type StdoutRedirectOperator = ">" | "1>" | "1>>" | ">>";
type StderrRedirectOperator = "2>" | "2>>";
export type RedirectOperator = StdoutRedirectOperator | StderrRedirectOperator;

export type BuiltinCommand = (args: string[]) => string | null;
export type ParsedCommand = {
  command: string;
  args: string[];
  redirects: OutputRedirect[];
};

export type OutputRedirect = {
  operator: RedirectOperator;
  path: string;
  operatorIndex?: number;
};
