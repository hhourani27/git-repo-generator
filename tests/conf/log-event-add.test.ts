import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Init event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Add: complete event: specific file", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test.txt", content: "test" } },
        { add: { file: "test.txt" } },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test.txt", 0, 2, 2],
    ]);
  });

  // TODO: test remove file
  test("Add: complete event: add all", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test1.txt", content: "test1" } },
        { "create file": { file: "test2.txt", content: "test2" } },
        { add: { all: true } },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test1.txt", 0, 2, 2],
      ["test2.txt", 0, 2, 2],
    ]);
  });

  test("Add: no properties", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test1.txt", content: "test1" } },
        { "create file": { file: "test2.txt", content: "test2" } },
        "add",
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test1.txt", 0, 2, 2],
      ["test2.txt", 0, 2, 2],
    ]);
  });
});
