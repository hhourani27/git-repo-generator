import { generateGitRepo } from "../src/index";
import mock from "mock-fs";
import fs from "node:fs/promises";
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

    const gitLog = await git.log({ fs, dir });
    expect(gitLog).toHaveLength(3);
  });
});
