import {
  AddCommand,
  AppendContentCommand,
  Command,
  CommitCommand,
  CreateFileCommand,
  InitCommand,
} from "./command";

export type InitEvent = "init" | InitCommand;
export type AddEvent = "add" | AddCommand;
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

  const commands: Command[] = [];

  for (const command of log) {
    if (command === "init") {
      commands.push({ init: { defaultBranch: "main" } });
    } else if (command === "add") {
      commands.push({ add: { all: true } });
    } else {
      commands.push(command);
    }
  }

  return commands;
}
