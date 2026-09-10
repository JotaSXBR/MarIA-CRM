import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { App } from "../src/app.tsx";

test("presents the initial development status", () => {
  expect(renderToStaticMarkup(<App />)).toContain(
    "a primeira versão ainda não está disponível",
  );
});
