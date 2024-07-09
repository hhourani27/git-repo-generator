import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Branch event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Branch", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "add", "commit", "branch branch1"],
    };

    await generateGitRepo(dir, conf);

    expect((await git.listBranches({ fs, dir })).sort()).toEqual([
      "branch1",
      "main",
    ]);
    expect(await git.currentBranch({ fs, dir })).toEqual("main");
  });
});
