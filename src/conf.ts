import {
  AddCommand,
  AppendContentCommand,
  Command,
  CommitCommand,
  CreateFileCommand,
  InitCommand,
} from "./command";
import { EventLogError } from "./errors/EventLogError";

type WithPrefix<T extends string> = `${T}${string}`;

export type InitEvent = "init" | InitCommand;
export type AddEvent = "add" | AddCommand;
export type CommitEvent =
  | "commit"
  | { commit: { message?: string; name?: string; email?: string } };
export type CreateFileEvent =
  | WithPrefix<"create file">
  | { "create file": { file: string; content?: string } };
export type AppendContentEvent = AppendContentCommand;

export type Event =
  | InitEvent
  | AddEvent
  | CommitEvent
  | CreateFileEvent
  | AppendContentEvent;

const isInitEvent = (e: Event): e is InitEvent => {
  return (
    (typeof e === "string" && e === "init") ||
    (typeof e === "object" && "init" in e)
  );
};

const isAddEvent = (e: Event): e is AddEvent => {
  return (
    (typeof e === "string" && e === "add") ||
    (typeof e === "object" && "add" in e)
  );
};

const isCommitEvent = (e: Event): e is CommitEvent => {
  return (
    (typeof e === "string" && e === "commit") ||
    (typeof e === "object" && "commit" in e)
  );
};

const isCreateFileEvent = (e: Event): e is CreateFileEvent => {
  return (
    (typeof e === "string" && e.startsWith("create file")) ||
    (typeof e === "object" && "create file" in e)
  );
};

export type GitConf = {
  log: Event[];
};

export function confToCommands(conf: GitConf): Command[] {
  const log = conf.log;

  const commands: Command[] = [];

  let commitCounter = 0;

  for (let i = 0; i < conf.log.length; i++) {
    const event = conf.log[i];

    if (isInitEvent(event)) {
      if (event === "init") {
        commands.push({ init: { defaultBranch: "main" } });
      } else {
        commands.push(event);
      }
    } else if (isAddEvent(event)) {
      if (event === "add") {
        commands.push({ add: { all: true } });
      } else {
        commands.push(event);
      }
    } else if (isCommitEvent(event)) {
      if (event === "commit") {
        commands.push({
          commit: {
            message: `commit ${commitCounter + 1}`,
            name: "user-test",
            email: "user-test@example.com",
          },
        });
      } else {
        commands.push({
          commit: {
            message: event.commit.message ?? `commit ${commitCounter + 1}`,
            name: event.commit.name ?? "user-test",
            email: event.commit.email ?? "user-test@example.com",
          },
        });
      }
      commitCounter++;
    } else if (isCreateFileEvent(event)) {
      if (typeof event === "string") {
        const fileName = event.substring("create file".length).trim();
        if (fileName === "") {
          throw new EventLogError(`"create file": missing file name`, i + 1);
        }
        commands.push({ "create file": { file: fileName, content: fileName } });
      } else {
        const file = event["create file"].file;
        const content = event["create file"].content ?? file;
        commands.push({ "create file": { file, content } });
      }
    } else {
      commands.push(event);
    }
  }

  return commands;
}