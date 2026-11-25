// Espelha o modelo e as regras do backend (Appointment, AppointmentStatus e
// AppointmentService). Enquanto o serviço não for conectado, o app usa estes
// dados de demonstração, como já acontece com os treinos.

export type AppointmentStatus =
    | "AGENDADO"
    | "CONFIRMADO"
    | "REALIZADO"
    | "CANCELADO"
    | "AUSENCIA"
    | "REAGENDADO";

export type Slot = {
    data: string; // "AAAA-MM-DD"
    horaInicio: string; // "HH:MM"
    horaFim: string; // "HH:MM"
};

export type Appointment = Slot & {
    id: number;
    personalId: number;
    status: AppointmentStatus;
    observacao?: string;
    confirmado: boolean;
};

export const PERSONAL_ID = 1;
export const PERSONAL_NAME = "JW Personal Trainer";

export const statusLabels: Record<AppointmentStatus, string> = {
    AGENDADO: "Agendado",
    CONFIRMADO: "Confirmado",
    REALIZADO: "Realizado",
    CANCELADO: "Cancelado",
    AUSENCIA: "Ausência",
    REAGENDADO: "Reagendado",
};

// Agendamentos que ainda vão acontecer (aba "Próximos"); o resto é histórico.
export const activeStatuses: AppointmentStatus[] = [
    "AGENDADO",
    "CONFIRMADO",
    "REAGENDADO",
];

export function isActive(appointment: Appointment) {
    return activeStatuses.includes(appointment.status);
}

// ---------- datas e horas ----------

function pad(value: number) {
    return String(value).padStart(2, "0");
}

export function toIsoDate(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso() {
    return toIsoDate(new Date());
}

export function addDays(iso: string, days: number) {
    const [year, month, day] = iso.split("-").map(Number);
    return toIsoDate(new Date(year, month - 1, day + days));
}

export function formatDate(iso: string) {
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
}

const weekdays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function weekdayLabel(iso: string) {
    const [year, month, day] = iso.split("-").map(Number);
    return weekdays[new Date(year, month - 1, day).getDay()];
}

// "dd/mm/aaaa" -> "AAAA-MM-DD" (null se não for uma data real)
export function parseDate(text: string) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }
    return toIsoDate(date);
}

// "hh:mm" -> "HH:MM" (null se inválido)
export function parseTime(text: string) {
    const match = /^(\d{2}):(\d{2})$/.exec(text.trim());
    if (!match) return null;
    if (Number(match[1]) > 23 || Number(match[2]) > 59) return null;
    return text.trim();
}

export function maskDate(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    return (
        digits.slice(0, 2) +
        (digits.length > 2 ? "/" + digits.slice(2, 4) : "") +
        (digits.length > 4 ? "/" + digits.slice(4, 8) : "")
    );
}

export function maskTime(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    return (
        digits.slice(0, 2) + (digits.length > 2 ? ":" + digits.slice(2, 4) : "")
    );
}

// ---------- regras de negócio (mesmas mensagens do AppointmentService) ----------

// Igual ao existeConflito do repositório: mesmo personal, mesma data,
// ignora CANCELADO e AUSENCIA e confere sobreposição de horários.
export function hasConflict(
    existing: Appointment[],
    personalId: number,
    slot: Slot,
) {
    return existing.some(
        (a) =>
            a.personalId === personalId &&
            a.data === slot.data &&
            a.status !== "CANCELADO" &&
            a.status !== "AUSENCIA" &&
            a.horaInicio < slot.horaFim &&
            a.horaFim > slot.horaInicio,
    );
}

export type SlotInput = { data: string; horaInicio: string; horaFim: string };

// Valida o que foi digitado no formulário. "agendar" e "reagendar" usam a
// mensagem de conflito correspondente do backend.
export function validateSlot(
    input: SlotInput,
    existing: Appointment[],
    mode: "agendar" | "reagendar",
): { slot: Slot } | { error: string } {
    const data = parseDate(input.data);
    if (!data) return { error: "Erro: informe uma data válida (dd/mm/aaaa)." };

    const horaInicio = parseTime(input.horaInicio);
    const horaFim = parseTime(input.horaFim);
    if (!horaInicio || !horaFim) {
        return { error: "Erro: informe horários válidos (hh:mm)." };
    }
    if (horaFim <= horaInicio) {
        return { error: "Erro: o horário de término deve ser depois do início." };
    }
    if (data < todayIso()) {
        return { error: "Erro: a data não pode estar no passado." };
    }

    const slot = { data, horaInicio, horaFim };
    if (hasConflict(existing, PERSONAL_ID, slot)) {
        return {
            error:
                mode === "agendar"
                    ? "Conflito de horário. Escolha outro horário."
                    : "Conflito de horário no novo agendamento.",
        };
    }
    return { slot };
}

// Mesmas regras de AppointmentService.cancelar + CancelamentoComPrazo.
export function cancelError(appointment: Appointment, today: string) {
    if (appointment.status === "REALIZADO") {
        return "Não é possível cancelar uma sessão já realizada";
    }
    if (appointment.status === "CANCELADO") {
        return "Agendamento já está cancelado";
    }
    if (appointment.data === today) {
        return "Cancelamento não permitido. Prazo mínimo de 24h de antecedência.";
    }
    return null;
}

// ---------- dados de demonstração ----------

export function initialAppointments(base: string = todayIso()): Appointment[] {
    const common = { personalId: PERSONAL_ID };
    return [
        {
            ...common,
            id: 1,
            data: addDays(base, 2),
            horaInicio: "18:00",
            horaFim: "19:00",
            status: "CONFIRMADO",
            confirmado: true,
        },
        {
            ...common,
            id: 2,
            data: base,
            horaInicio: "17:00",
            horaFim: "18:00",
            status: "AGENDADO",
            confirmado: false,
        },
        {
            ...common,
            id: 3,
            data: addDays(base, 7),
            horaInicio: "19:00",
            horaFim: "20:00",
            status: "REAGENDADO",
            observacao: "Reagendado por você",
            confirmado: false,
        },
        {
            ...common,
            id: 4,
            data: addDays(base, -3),
            horaInicio: "18:00",
            horaFim: "19:00",
            status: "REALIZADO",
            confirmado: true,
        },
        {
            ...common,
            id: 5,
            data: addDays(base, -7),
            horaInicio: "07:00",
            horaFim: "08:00",
            status: "CANCELADO",
            observacao: "Cancelado por você: Imprevisto no trabalho",
            confirmado: false,
        },
        {
            ...common,
            id: 6,
            data: addDays(base, -10),
            horaInicio: "18:00",
            horaFim: "19:00",
            status: "AUSENCIA",
            confirmado: true,
        },
    ];
}


