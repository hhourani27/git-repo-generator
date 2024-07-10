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

  test("Create branch", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "commit", "branch branch1"],
    };

    await generateGitRepo(dir, conf);

    expect((await git.listBranches({ fs, dir })).sort()).toEqual([
      "branch1",
      "main",
    ]);
    expect(await git.currentBranch({ fs, dir })).toEqual("main");
  });

  test("Missing branch name", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "commit", "branch "],
    };

    expect.assertions(1);
    try {
      await generateGitRepo(dir, conf);
    } catch (error) {
      expect((error as Error).message).toMatch(
        `line 4: "branch": missing branch name`
      );
    }
  });
});
