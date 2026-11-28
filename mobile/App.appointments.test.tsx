import { fireEvent, render, screen } from "@testing-library/react-native";
import { expect, test } from "@jest/globals";
import App from "./App";

test("abre Meus agendamentos pela conta e volta à Home com o filtro preservado", async () => {
  await render(<App />);
  await fireEvent.changeText(
    screen.getByLabelText("Digite seu e-mail"),
    "aluno@example.com",
  );
  await fireEvent.changeText(screen.getByLabelText("Senha"), "demonstracao");
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));

  await fireEvent.press(screen.getByRole("tab", { name: "Peito" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Conta" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "Meus agendamentos" }),
  );
  expect(
    screen.getByRole("header", { name: "Meus agendamentos" }),
  ).toBeTruthy();
  expect(screen.queryByRole("tab", { name: "Inicio" })).toBeNull();

  await fireEvent.press(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("tab", { name: "Inicio" })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Ver Supino com halteres" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Ver Puxada para costas" }),
  ).toBeNull();
});