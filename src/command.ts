export type InitCommand = {
  init: { defaultBranch: string };
};

export type AddCommand = {
  add: { file: string };
};

export type CommitCommand = {
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
    };
  };
};

export type CreateFileCommand = {
  "create file": { file: string; content: string };
};

export type AppendLineCommand = {
  "append content": { file: string; content: string };
};

export type Command =
  | InitCommand
  | AddCommand
  | CommitCommand
  | CreateFileCommand
  | AppendLineCommand;
