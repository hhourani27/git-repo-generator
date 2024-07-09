import {
  AddCommand,
  AppendContentCommand,
  Command,
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

export function confToCommands(conf: GitConf): Command[] {
  const log = conf.log;

  return conf.log;
}
