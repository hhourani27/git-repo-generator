import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import { GitConf } from "../../src/conf";
import path from "node:path";

describe("Change content event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Change content", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test.txt", content: "content" } },
        { "change content": { file: "test.txt", content: "new content" } },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "new content"
    );
  });
});
