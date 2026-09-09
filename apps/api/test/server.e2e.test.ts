import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { expect, test } from "vitest";

test("built server responds over HTTP and shuts down on SIGTERM", async () => {
  const child = spawn(process.execPath, ["dist/server.js"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const exited = once(child, "exit");
  const lines = createInterface({ input: child.stdout });
  // Process startup on a mounted Windows filesystem can exceed eight seconds.
  const timeout = setTimeout(() => child.kill("SIGKILL"), 25000);
  try {
    let address: string | undefined;
    for await (const line of lines) {
      const match = /Server listening at (http:\/\/127\.0\.0\.1:\d+)/.exec(
        line,
      );
      if (match) {
        address = match[1];
        break;
      }
    }
    expect(address).toBeDefined();
    const response = await fetch(`${address}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    child.kill("SIGTERM");
    expect(await exited).toEqual([0, null]);
  } finally {
    clearTimeout(timeout);
    lines.close();
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
    await exited;
  }
}, 30000);
