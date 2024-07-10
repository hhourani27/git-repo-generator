export type InitCommand = {
  init: { defaultBranch: string };
};

export type CommitCommand = {
  commit: {
    message: string;
    author: string;
    email: string;
  };
};

export type CreateBranchCommand = {
  branch: {
    name: string;
  };
};

export type CheckoutCommand = {
  checkout: {
    ref: string;
  };
};

export type MergeCommand = {
  merge: {
    theirs: string;
    message: string;
    author: string;
    email: string;
  };
};

export type TagCommand = {
  tag: {
    name: string;
  };
};

export type CreateFileCommand = {
  "create file": { file: string; content: string };
};

export type ChangeContentCommand = {
  "change content": { file: string; content: string };
};

export type AppendContentCommand = {
  "append content": { file: string; content: string; newLine: boolean };
};

export type Command =
  | InitCommand
  | CommitCommand
  | CreateBranchCommand
  | CheckoutCommand
  | MergeCommand
  | TagCommand
  | CreateFileCommand
  | ChangeContentCommand
  | AppendContentCommand;
