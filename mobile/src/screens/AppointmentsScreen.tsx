import { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
    BackHandler,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Notice } from "../components/Notice";
import {
    Appointment,
    cancelError,
    formatDate,
    initialAppointments,
    isActive,
    PERSONAL_ID,
    PERSONAL_NAME,
    Slot,
    statusLabels,
    todayIso,
    weekdayLabel,
} from "../data/appointments";
import { colors, fonts } from "../theme";
import { NewAppointmentScreen } from "./NewAppointmentScreen";

type Tab = "Próximos" | "Histórico";
const tabs: Tab[] = ["Próximos", "Histórico"];

function sortKey(a: Appointment) {
    return `${a.data} ${a.horaInicio}`;
}

export function AppointmentsScreen({ onBack }: { onBack: () => void }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const scale = Math.min(width, 430) / 430;
    const [appointments, setAppointments] = useState(() => initialAppointments());
    const [tab, setTab] = useState<Tab>("Próximos");
    const [form, setForm] = useState<{ editing: Appointment | null } | null>(
        null,
    );
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState("");
    const [notice, setNotice] = useState<{
        title: string;
        message: string;
    } | null>(null);

    // Com o formulário aberto, o botão voltar do Android fecha só o formulário.
    useEffect(() => {
        if (!form) return undefined;
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                setForm(null);
                return true;
            },
        );
        return () => subscription.remove();
    }, [form]);

    const visible = appointments
        .filter((a) => (tab === "Próximos" ? isActive(a) : !isActive(a)))
        .sort((a, b) =>
            tab === "Próximos"
                ? sortKey(a).localeCompare(sortKey(b))
                : sortKey(b).localeCompare(sortKey(a)),
        );

    function openSheet(appointment: Appointment) {
        setSelected(appointment);
        setCancelling(false);
        setReason("");
        setReasonError("");
    }

    function closeSheet() {
        setSelected(null);
        setCancelling(false);
        setReason("");
        setReasonError("");
    }

    function startCancel(appointment: Appointment) {
        const error = cancelError(appointment, todayIso());
        if (error) {
            closeSheet();
            setNotice({ title: "Não foi possível cancelar", message: error });
            return;
        }
        setCancelling(true);
    }

    function confirmCancel(appointment: Appointment) {
        if (!reason.trim()) {
            setReasonError("Erro: informe o motivo do cancelamento.");
            return;
        }
        setAppointments((current) =>
            current.map((a) =>
                a.id === appointment.id
                    ? {
                        ...a,
                        status: "CANCELADO",
                        observacao: `Cancelado por você: ${reason.trim()}`,
                    }
                    : a,
            ),
        );
        closeSheet();
        setNotice({
            title: "Agendamento cancelado",
            message: "O registro continua disponível na aba Histórico.",
        });
    }

    function startReschedule(appointment: Appointment) {
        closeSheet();
        setForm({ editing: appointment });
    }

    function save(slot: Slot) {
        const editing = form?.editing ?? null;
        if (editing) {
            // Igual ao AppointmentService.reagendar: volta a precisar de confirmação.
            setAppointments((current) =>
                current.map((a) =>
                    a.id === editing.id
                        ? {
                            ...a,
                            ...slot,
                            status: "REAGENDADO",
                            confirmado: false,
                            observacao: "Reagendado por você",
                        }
                        : a,
                ),
            );
            setNotice({
                title: "Agendamento reagendado",
                message: "O personal precisará confirmar o novo horário.",
            });
        } else {
            setAppointments((current) => [
                ...current,
                {
                    ...slot,
                    id: Math.max(0, ...current.map((a) => a.id)) + 1,
                    personalId: PERSONAL_ID,
                    status: "AGENDADO",
                    confirmado: false,
                },
            ]);
            setNotice({
                title: "Agendamento criado",
                message: "O personal precisará confirmar o horário.",
            });
        }
        setTab("Próximos");
        setForm(null);
    }

    if (form) {
        return (
            <NewAppointmentScreen
                editing={form.editing}
                existing={appointments}
                onBack={() => setForm(null)}
                onSave={save}
            />
        );
    }

    return (
        <View style={styles.screen}>
            <View style={{ height: Math.max(insets.top, 60) }} />
            <View
                style={[
                    styles.header,
                    { paddingLeft: 18 * scale, paddingRight: 34 * scale },
                ]}
            >
                <View style={styles.titleRow}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        hitSlop={8}
                        onPress={onBack}
                        style={styles.back}
                    >
                        <Image
                            source={require("../../assets/back.png")}
                            style={styles.backImage}
                            tintColor={colors.ink}
                        />
                    </Pressable>
                    <Text accessibilityRole="header" style={styles.title}>
                        Meus agendamentos
                    </Text>
                </View>
                <View style={[styles.logoCrop, { width: 94 * scale }]}>
                    <Image
                        accessibilityLabel="JW Personal Trainer"
                        source={require("../../assets/logo.png")}
                        style={[
                            styles.logo,
                            { width: 94 * scale, height: 94 * scale, top: -18 * scale },
                        ]}
                        contentFit="fill"
                    />
                </View>
            </View>
            <View style={[styles.tabs, { paddingLeft: 23 * scale }]}>
                {tabs.map((item) => (
                    <Pressable
                        key={item}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: tab === item }}
                        onPress={() => setTab(item)}
                        style={styles.tab}
                    >
                        <Text style={styles.tabText}>{item}</Text>
                        {tab === item && (
                            <Image
                                source={require("../../assets/selected-line.svg")}
                                style={styles.selectedLine}
                                contentFit="fill"
                            />
                        )}
                    </Pressable>
                ))}
            </View>
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {visible.map((a) => (
                    <Pressable
                        key={a.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Agendamento de ${formatDate(a.data)} das ${a.horaInicio} às ${a.horaFim}, ${statusLabels[a.status]}`}
                        onPress={() => openSheet(a)}
                        style={styles.card}
                    >
                        <View style={styles.cardRow}>
                            <Text style={styles.cardDate}>
                                {weekdayLabel(a.data)}, {formatDate(a.data)}
                            </Text>
                            <View style={styles.badge}>
                                <Text
                                    style={[
                                        styles.badgeText,
                                        a.status === "CANCELADO" && styles.badgeCancelled,
                                    ]}
                                >
                                    {statusLabels[a.status]}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.cardTime}>
                            {a.horaInicio} – {a.horaFim}
                        </Text>
                        <Text style={styles.cardMeta}>{PERSONAL_NAME}</Text>
                    </Pressable>
                ))}
                {!visible.length && (
                    <Text style={styles.empty}>Nenhum agendamento nesta aba.</Text>
                )}
            </ScrollView>
            <View
                style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
                <Pressable
                    accessibilityRole="button"
                    onPress={() => setForm({ editing: null })}
                    style={({ pressed }) => [
                        styles.newButton,
                        pressed && { opacity: 0.7 },
                    ]}
                >
                    <Text style={styles.newButtonText}>Novo agendamento</Text>
                </Pressable>
            </View>
            {selected && (
                <Modal transparent animationType="fade" onRequestClose={closeSheet}>
                    <View style={styles.modalOverlay}>
                        <View accessibilityViewIsModal style={styles.sheet}>
                            {!cancelling ? (
                                <>
                                    <Text accessibilityRole="header" style={styles.sheetTitle}>
                                        {formatDate(selected.data)} · {selected.horaInicio} –{" "}
                                        {selected.horaFim}
                                    </Text>
                                    <Text style={styles.sheetText}>
                                        Status: {statusLabels[selected.status]}
                                    </Text>
                                    {!!selected.observacao && (
                                        <Text style={[styles.sheetText, styles.sheetNote]}>
                                            {selected.observacao}
                                        </Text>
                                    )}
                                    {isActive(selected) && (
                                        <>
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => startReschedule(selected)}
                                                style={styles.sheetAction}
                                            >
                                                <Text style={styles.sheetText}>Reagendar</Text>
                                            </Pressable>
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => startCancel(selected)}
                                                style={styles.sheetAction}
                                            >
                                                <Text style={styles.sheetText}>
                                                    Cancelar agendamento
                                                </Text>
                                            </Pressable>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Text accessibilityRole="header" style={styles.sheetTitle}>
                                        Cancelar agendamento
                                    </Text>
                                    <TextInput
                                        accessibilityLabel="Motivo do cancelamento"
                                        placeholder="Motivo do cancelamento"
                                        value={reason}
                                        onChangeText={(text) => {
                                            setReason(text);
                                            setReasonError("");
                                        }}
                                        autoFocus
                                        returnKeyType="done"
                                        style={styles.searchInput}
                                    />
                                    {!!reasonError && (
                                        <Text
                                            accessibilityRole="alert"
                                            accessibilityLiveRegion="polite"
                                            style={styles.sheetError}
                                        >
                                            {reasonError}
                                        </Text>
                                    )}
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => confirmCancel(selected)}
                                        style={styles.sheetAction}
                                    >
                                        <Text style={styles.sheetText}>Confirmar cancelamento</Text>
                                    </Pressable>
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => setCancelling(false)}
                                        style={styles.sheetAction}
                                    >
                                        <Text style={styles.sheetText}>Voltar</Text>
                                    </Pressable>
                                </>
                            )}
                            <Pressable
                                accessibilityRole="button"
                                onPress={closeSheet}
                                style={styles.close}
                            >
                                <Text style={styles.closeText}>Fechar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
            {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.white },
    header: {
        height: 68,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    back: { width: 37, height: 37 },
    backImage: { width: 37, height: 37, transform: [{ scaleX: -1 }] },
    title: { fontFamily: fonts.body, fontSize: 20, color: colors.ink },
    logoCrop: { width: 94, height: 52, overflow: "hidden" },
    logo: { width: 94, height: 94, top: -18 },
    tabs: { flexDirection: "row", gap: 24, minHeight: 44, alignItems: "center" },
    tab: { minHeight: 44, justifyContent: "center" },
    tabText: { fontFamily: fonts.category, fontSize: 16, color: colors.ink },
    selectedLine: {
        position: "absolute",
        bottom: 9,
        left: 0,
        right: 0,
        height: 1,
    },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 12 },
    card: {
        backgroundColor: colors.navigation,
        borderRadius: 16,
        padding: 16,
        minHeight: 44,
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardDate: { fontFamily: fonts.body, fontSize: 16, color: colors.white },
    cardTime: {
        fontFamily: fonts.body,
        fontSize: 22,
        color: colors.white,
        marginTop: 8,
    },
    cardMeta: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.white,
        opacity: 0.75,
        marginTop: 4,
    },
    badge: {
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: 50,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    badgeText: { fontFamily: fonts.body, fontSize: 13, color: colors.white },
    badgeCancelled: { color: colors.error },
    empty: {
        marginTop: 40,
        textAlign: "center",
        fontFamily: fonts.body,
        fontSize: 16,
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: colors.white,
    },
    newButton: {
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.selected,
        alignItems: "center",
        minHeight: 44,
        justifyContent: "center",
    },
    newButtonText: { fontFamily: fonts.body, color: colors.white },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheet: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 380,
        alignSelf: "center",
    },
    sheetTitle: { fontFamily: fonts.body, fontSize: 20, marginBottom: 16 },
    sheetText: { fontFamily: fonts.body, fontSize: 16 },
    sheetNote: { marginTop: 8, color: colors.selected },
    sheetAction: { minHeight: 48, justifyContent: "center" },
    sheetError: {
        color: colors.error,
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 23,
        marginTop: 8,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#AAAAAA",
        borderRadius: 8,
        padding: 12,
        fontFamily: fonts.body,
        fontSize: 16,
    },
    close: {
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.selected,
        alignItems: "center",
        marginTop: 12,
    },
    closeText: { fontFamily: fonts.body, color: colors.white },
});