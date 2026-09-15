import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "../src/app.tsx";

test("presents the initial development status", () => {
  render(<App />);
  expect(
    screen.getByText(/a primeira versão ainda não está disponível/),
  ).toBeDefined();
});
