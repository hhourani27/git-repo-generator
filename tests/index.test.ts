import { generateGitRepo } from "../src/index";
import mock from "mock-fs";
import fs from "node:fs/promises";
import path from "node:path";
import git from "isomorphic-git";

describe("generateGitRepo", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({});
  });

  afterEach(() => {
    mock.restore();
  });

  test("Generate simple repo", async () => {
    await generateGitRepo({
      dir,
      commits: 3,
    });

    expect(await git.log({ fs, dir })).toHaveLength(3);
    expect(await git.listBranches({ fs, dir })).toEqual(["main"]);
    expect(await fs.readdir(dir)).toEqual([".git", "test.txt"]);
    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "line 1\nline 2\nline 3"
    );
  });

  test("Generate simple repo with no commit", async () => {
    await generateGitRepo({
      dir,
      commits: 0,
    });

    expect(await git.listBranches({ fs, dir })).toHaveLength(0);
  });
});
