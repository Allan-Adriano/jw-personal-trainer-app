import { fireEvent, render, screen } from "@testing-library/react-native";
import { expect, jest, test } from "@jest/globals";
import { addDays, formatDate, todayIso } from "../data/appointments";
import { AppointmentsScreen } from "./AppointmentsScreen";

const hoje = formatDate(todayIso());
const em2dias = formatDate(addDays(todayIso(), 2));
const em7dias = formatDate(addDays(todayIso(), 7));
const em20dias = formatDate(addDays(todayIso(), 20));

async function renderScreen() {
    const onBack = jest.fn();
    await render(<AppointmentsScreen onBack={onBack} />);
    return onBack;
}

async function fillForm(date: string, start: string, end: string) {
    await fireEvent.changeText(screen.getByLabelText("Data"), date);
    await fireEvent.changeText(screen.getByLabelText("Horário de início"), start);
    await fireEvent.changeText(screen.getByLabelText("Horário de término"), end);
}

test("lista os próximos agendamentos e separa o histórico", async () => {
    const onBack = await renderScreen();
    expect(
        screen.getByRole("button", { name: new RegExp(`${em2dias}.*Confirmado`) }),
    ).toBeTruthy();
    expect(
        screen.getByRole("button", { name: new RegExp(`${hoje}.*Agendado`) }),
    ).toBeTruthy();
    expect(
        screen.getByRole("button", { name: new RegExp(`${em7dias}.*Reagendado`) }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Realizado/ })).toBeNull();

    await fireEvent.press(screen.getByRole("tab", { name: "Histórico" }));
    expect(screen.getByRole("button", { name: /Realizado/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cancelado/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ausência/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Confirmado/ })).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Voltar" }));
    expect(onBack).toHaveBeenCalledTimes(1);
});

test("cria um agendamento e valida os campos e o conflito de horário", async () => {
    await renderScreen();
    await fireEvent.press(
        screen.getByRole("button", { name: "Novo agendamento" }),
    );

    await fireEvent.press(screen.getByRole("button", { name: "Agendar" }));
    expect(
        screen.getByText("Erro: informe uma data válida (dd/mm/aaaa)."),
    ).toBeTruthy();

    await fillForm(em2dias, "18:30", "19:30");
    await fireEvent.press(screen.getByRole("button", { name: "Agendar" }));
    expect(
        screen.getByText("Conflito de horário. Escolha outro horário."),
    ).toBeTruthy();

    await fillForm(em20dias, "10:00", "11:00");
    await fireEvent.press(screen.getByRole("button", { name: "Agendar" }));
    expect(screen.getByText("Agendamento criado")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Entendi" }));
    expect(
        screen.getByRole("button", {
            name: new RegExp(`${em20dias} das 10:00 às 11:00, Agendado`),
        }),
    ).toBeTruthy();
});

test("não permite cancelar um agendamento de hoje", async () => {
    await renderScreen();
    await fireEvent.press(
        screen.getByRole("button", { name: new RegExp(`${hoje}.*Agendado`) }),
    );
    await fireEvent.press(
        screen.getByRole("button", { name: "Cancelar agendamento" }),
    );
    expect(
        screen.getByText(
            "Cancelamento não permitido. Prazo mínimo de 24h de antecedência.",
        ),
    ).toBeTruthy();
});

test("cancela exigindo o motivo e move o agendamento para o histórico", async () => {
    await renderScreen();
    await fireEvent.press(
        screen.getByRole("button", { name: new RegExp(`${em2dias}.*Confirmado`) }),
    );
    await fireEvent.press(
        screen.getByRole("button", { name: "Cancelar agendamento" }),
    );

    await fireEvent.press(
        screen.getByRole("button", { name: "Confirmar cancelamento" }),
    );
    expect(
        screen.getByText("Erro: informe o motivo do cancelamento."),
    ).toBeTruthy();

    await fireEvent.changeText(
        screen.getByLabelText("Motivo do cancelamento"),
        "Viagem",
    );
    await fireEvent.press(
        screen.getByRole("button", { name: "Confirmar cancelamento" }),
    );
    expect(screen.getByText("Agendamento cancelado")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Entendi" }));

    expect(
        screen.queryByRole("button", {
            name: new RegExp(`${em2dias}.*Confirmado`),
        }),
    ).toBeNull();
    await fireEvent.press(screen.getByRole("tab", { name: "Histórico" }));
    expect(
        screen.getByRole("button", { name: new RegExp(`${em2dias}.*Cancelado`) }),
    ).toBeTruthy();
});

test("reagenda e volta a exigir confirmação do personal", async () => {
    await renderScreen();
    await fireEvent.press(
        screen.getByRole("button", { name: new RegExp(`${em2dias}.*Confirmado`) }),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Reagendar" }));

    expect(screen.getByLabelText("Data").props.value).toBe(em2dias);
    await fillForm(em20dias, "09:00", "10:00");
    await fireEvent.press(screen.getByRole("button", { name: "Reagendar" }));
    expect(screen.getByText("Agendamento reagendado")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Entendi" }));
    expect(
        screen.getByRole("button", {
            name: new RegExp(`${em20dias} das 09:00 às 10:00, Reagendado`),
        }),
    ).toBeTruthy();
});