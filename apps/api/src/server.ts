import { buildApp } from "./app.ts";
import { listenOptions } from "./config.ts";

const app = buildApp();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    app.close().catch((error: unknown) => {
      app.log.error(error);
      process.exitCode = 1;
    });
  });
}
try {
  await app.listen(listenOptions(process.env));
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}
