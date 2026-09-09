import { expect, test } from "vitest";
import { listenOptions } from "../src/config.ts";

test("defaults to loopback and accepts ephemeral ports", () => {
  expect(listenOptions({})).toEqual({ host: "127.0.0.1", port: 3000 });
  expect(listenOptions({ PORT: "0" }).port).toBe(0);
});

test.each(["", "-1", "1.5", "65536", "abc", "1e3"])(
  "rejects invalid port %s",
  (PORT) => {
    expect(() => listenOptions({ PORT })).toThrow("PORT must be");
  },
);
