export type OutputOperator = ">>" | ">" | "1>";
export type BuiltinCommand = (args: string[]) => string | null;
export type ParsedCommand = {
  command: string;
  args: string[];
  redirects: OutputRedirect[];
};

export type OutputRedirect = {
  operator: OutputOperator;
  path: string;
  operatorIndex?: number;
};
