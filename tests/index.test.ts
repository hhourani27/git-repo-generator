import { helloWorld } from "../src/index";

test("helloWorld function", () => {
  expect(helloWorld()).toBe("Hello, world!");
});
