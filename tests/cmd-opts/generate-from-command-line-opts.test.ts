import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import path from "node:path";
import git from "isomorphic-git";

describe("Generate from command line opts", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Generate simple repo", async () => {
    await generateGitRepo(dir, {
      commits: 3,
    });

    expect(await git.log({ fs, dir })).toHaveLength(3);
    expect(await git.listBranches({ fs, dir })).toEqual(["main"]);
    expect(await fs.readdir(dir)).toEqual([".git", "test.txt"]);
    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "text 3"
    );
  });

  test("Generate simple repo with no commit", async () => {
    await generateGitRepo(dir, {
      commits: 0,
    });

    expect(await git.listBranches({ fs, dir })).toHaveLength(0);
  });

  test("Cannot override existing git repo", async () => {
    await fs.mkdir(path.join(dir, ".git"), { recursive: true });

    expect.assertions(1);
    try {
      await generateGitRepo(dir, {
        commits: 3,
      });
    } catch (error) {
      expect((error as Error).message).toMatch(
        "A Git repository already exists"
      );
    }
  });
});
