import { expect, test } from "@jest/globals";
import {
    addDays,
    Appointment,
    cancelError,
    hasConflict,
    initialAppointments,
    maskDate,
    maskTime,
    parseDate,
    parseTime,
    todayIso,
    validateSlot,
} from "./appointments";

const base = "2026-11-24";

test("converte e valida datas e horários digitados", () => {
    expect(parseDate("24/11/2026")).toBe("2026-11-24");
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("2026-11-24")).toBeNull();
    expect(parseTime("09:30")).toBe("09:30");
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("9:30")).toBeNull();
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
});

test("aplica as máscaras de data e hora", () => {
    expect(maskDate("24112026")).toBe("24/11/2026");
    expect(maskDate("24/1")).toBe("24/1");
    expect(maskDate("24/")).toBe("24");
    expect(maskTime("0930")).toBe("09:30");
    expect(maskTime("09")).toBe("09");
});

test("detecta conflito como o backend: ignora cancelados e ausências", () => {
    const list: Appointment[] = initialAppointments(base);
    // id 1 está CONFIRMADO em 26/11 das 18:00 às 19:00
    const sobreposto = {
        data: "2026-11-26",
        horaInicio: "18:30",
        horaFim: "19:30",
    };
    expect(hasConflict(list, 1, sobreposto)).toBe(true);
    // horários colados não conflitam: termina às 18:00 ou começa às 19:00
    expect(
        hasConflict(list, 1, {
            data: "2026-11-26",
            horaInicio: "17:00",
            horaFim: "18:00",
        }),
    ).toBe(false);
    expect(
        hasConflict(list, 1, {
            data: "2026-11-26",
            horaInicio: "19:00",
            horaFim: "20:00",
        }),
    ).toBe(false);
    // id 5 está CANCELADO em 17/11 das 07:00 às 08:00: horário liberado
    expect(
        hasConflict(list, 1, {
            data: "2026-11-17",
            horaInicio: "07:00",
            horaFim: "08:00",
        }),
    ).toBe(false);
});

test("validateSlot devolve as mensagens esperadas", () => {
    const list = initialAppointments();
    const futuro = addDays(todayIso(), 30);
    const [y, m, d] = futuro.split("-");
    const data = `${d}/${m}/${y}`;

    expect(
        validateSlot(
            { data: "xx", horaInicio: "10:00", horaFim: "11:00" },
            list,
            "agendar",
        ),
    ).toEqual({
        error: "Erro: informe uma data válida (dd/mm/aaaa).",
    });
    expect(
        validateSlot({ data, horaInicio: "10", horaFim: "11:00" }, list, "agendar"),
    ).toEqual({
        error: "Erro: informe horários válidos (hh:mm).",
    });
    expect(
        validateSlot(
            { data, horaInicio: "11:00", horaFim: "10:00" },
            list,
            "agendar",
        ),
    ).toEqual({
        error: "Erro: o horário de término deve ser depois do início.",
    });
    expect(
        validateSlot(
            { data: "01/01/2020", horaInicio: "10:00", horaFim: "11:00" },
            list,
            "agendar",
        ),
    ).toEqual({
        error: "Erro: a data não pode estar no passado.",
    });
    expect(
        validateSlot(
            { data, horaInicio: "10:00", horaFim: "11:00" },
            list,
            "agendar",
        ),
    ).toEqual({
        slot: { data: futuro, horaInicio: "10:00", horaFim: "11:00" },
    });
});

test("cancelar segue as regras do backend", () => {
    const [confirmado, hoje, , realizado, cancelado] = initialAppointments(base);
    expect(cancelError(confirmado, base)).toBeNull();
    expect(cancelError(hoje, base)).toBe(
        "Cancelamento não permitido. Prazo mínimo de 24h de antecedência.",
    );
    expect(cancelError(realizado, base)).toBe(
        "Não é possível cancelar uma sessão já realizada",
    );
    expect(cancelError(cancelado, base)).toBe("Agendamento já está cancelado");
});