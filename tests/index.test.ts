import { generateGitRepo } from "../src/index";
import mock from "mock-fs";
import fs from "node:fs/promises";
import path from "node:path";
import git from "isomorphic-git";

describe("generateGitRepo", () => {
  beforeEach(() => {
    mock({});
  });

  afterEach(() => {
    mock.restore();
  });

  test("Generate simple repo", async () => {
    const dir = "/test";

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
});
