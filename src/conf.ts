import {
  AddCommand,
  AppendContentCommand,
  CommitCommand,
  CreateFileCommand,
  InitCommand,
} from "./command";

export type InitEvent = InitCommand;
export type AddEvent = AddCommand;
export type CommitEvent = CommitCommand;
export type CreateFileEvent = CreateFileCommand;
export type AppendContentEvent = AppendContentCommand;

export type Event =
  | InitEvent
  | AddEvent
  | CommitEvent
  | CreateFileEvent
  | AppendContentEvent;

export type GitConf = {
  log: Event[];
};
