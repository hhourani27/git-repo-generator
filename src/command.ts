export type CommitInfo = {
  message: string;
  author: string;
  email: string;
};

export type InitCommand = {
  init: { defaultBranch: string };
};

export type CommitCommand = {
  commit: CommitInfo;
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
  } & CommitInfo;
};

export type TagCommand = {
  tag: {
    name: string;
    annotated: boolean;
  } & CommitInfo;
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
