import { fireEvent, render, screen } from "@testing-library/react-native";
import App from "./App";

async function signIn() {
  await fireEvent.changeText(
    screen.getByLabelText("Digite seu e-mail"),
    "aluno@example.com",
  );
  await fireEvent.changeText(screen.getByLabelText("Senha"), "demonstracao");
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
}

test("valida os campos antes de abrir a home e permite mostrar a senha", async () => {
  await render(<App />);
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  expect(screen.getByText("Erro: informe um e-mail válido.")).toBeTruthy();
  expect(screen.queryByRole("tab", { name: "Inicio" })).toBeNull();
  await fireEvent.changeText(
    screen.getByLabelText("Digite seu e-mail"),
    "aluno@example.com",
  );
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  expect(
    screen.getByText("Erro: senha inválida. Tente novamente"),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Mostrar senha" }));
  expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(false);
  await signIn();
  expect(screen.getByRole("tab", { name: "Inicio" })).toBeTruthy();
});

test("filtra a galeria, busca treinos e encerra a sessão de demonstração", async () => {
  await render(<App />);
  await signIn();
  await fireEvent.press(screen.getByRole("tab", { name: "Peito" }));
  expect(
    screen.getByRole("button", { name: "Ver Supino com halteres" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Ver Puxada para costas" }),
  ).toBeNull();
  await fireEvent.press(screen.getByRole("tab", { name: "Inicio" }));
  await fireEvent.press(screen.getByRole("tab", { name: "Buscar" }));
  await fireEvent.changeText(
    screen.getByLabelText("Procure treinos"),
    "extensora",
  );
  await fireEvent.press(screen.getByRole("button", { name: "Ver resultados" }));
  expect(
    screen.getByRole("button", { name: "Ver Cadeira extensora" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Ver Supino com halteres" }),
  ).toBeNull();
  await fireEvent.press(screen.getByRole("tab", { name: "Conta" }));
  await fireEvent.press(screen.getByRole("button", { name: "Sair" }));
  expect(screen.getByLabelText("Senha").props.value).toBe("");
});

test("informa que a recuperação de senha depende da integração", async () => {
  await render(<App />);
  await fireEvent.press(
    screen.getByRole("button", { name: "Esqueceu a senha ?" }),
  );
  expect(
    screen.getByText(
      "A recuperação de senha estará disponível quando o serviço de autenticação for conectado.",
    ),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole("button", { name: "Entendi" }));
  expect(screen.queryByText("Recuperar senha")).toBeNull();
});
import { expect, test } from "@jest/globals";
