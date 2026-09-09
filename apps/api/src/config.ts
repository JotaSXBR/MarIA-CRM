export function listenOptions(env: NodeJS.ProcessEnv) {
  const value = env.PORT ?? "3000";
  const port = Number(value);
  if (!/^\d+$/.test(value) || !Number.isInteger(port) || port > 65535) {
    throw new Error("PORT must be an integer between 0 and 65535");
  }
  return { port, host: env.HOST ?? "127.0.0.1" };
}
