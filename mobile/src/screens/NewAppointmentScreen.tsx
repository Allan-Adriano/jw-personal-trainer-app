import { ComponentRef, useRef, useState } from "react";
import { Image } from "expo-image";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Appointment,
    formatDate,
    maskDate,
    maskTime,
    PERSONAL_NAME,
    Slot,
    validateSlot,
} from "../data/appointments";
import { colors, fonts } from "../theme";

type Props = {
    editing: Appointment | null; // preenchido quando for reagendar
    existing: Appointment[]; // usado na checagem de conflito de horário
    onBack: () => void;
    onSave: (slot: Slot) => void;
};

export function NewAppointmentScreen({
                                         editing,
                                         existing,
                                         onBack,
                                         onSave,
                                     }: Props) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const scale = Math.min(width, 430) / 430;
    const startInput = useRef<ComponentRef<typeof TextInput>>(null);
    const endInput = useRef<ComponentRef<typeof TextInput>>(null);
    const [date, setDate] = useState(editing ? formatDate(editing.data) : "");
    const [start, setStart] = useState(editing?.horaInicio ?? "");
    const [end, setEnd] = useState(editing?.horaFim ?? "");
    const [error, setError] = useState("");
    const title = editing ? "Reagendar" : "Novo agendamento";

    function submit() {
        Keyboard.dismiss();
        const result = validateSlot(
            { data: date, horaInicio: start, horaFim: end },
            existing,
            editing ? "reagendar" : "agendar",
        );
        if ("error" in result) {
            setError(result.error);
            return;
        }
        onSave(result.slot);
    }

    return (
        <View style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.fill}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingTop: Math.max(insets.top, 60),
                        paddingBottom: Math.max(insets.bottom, 32),
                    }}
                >
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
                                {title}
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
                    <View style={styles.form}>
                        <Text style={styles.info}>Personal: {PERSONAL_NAME}</Text>

                        <Text style={styles.label}>Data</Text>
                        <TextInput
                            accessibilityLabel="Data"
                            value={date}
                            onChangeText={(text) => {
                                setDate(maskDate(text));
                                setError("");
                            }}
                            placeholder="dd/mm/aaaa"
                            placeholderTextColor="#777777"
                            keyboardType="number-pad"
                            returnKeyType="next"
                            onSubmitEditing={() => startInput.current?.focus()}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Horário de início</Text>
                        <TextInput
                            ref={startInput}
                            accessibilityLabel="Horário de início"
                            value={start}
                            onChangeText={(text) => {
                                setStart(maskTime(text));
                                setError("");
                            }}
                            placeholder="hh:mm"
                            placeholderTextColor="#777777"
                            keyboardType="number-pad"
                            returnKeyType="next"
                            onSubmitEditing={() => endInput.current?.focus()}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Horário de término</Text>
                        <TextInput
                            ref={endInput}
                            accessibilityLabel="Horário de término"
                            value={end}
                            onChangeText={(text) => {
                                setEnd(maskTime(text));
                                setError("");
                            }}
                            placeholder="hh:mm"
                            placeholderTextColor="#777777"
                            keyboardType="number-pad"
                            returnKeyType="go"
                            onSubmitEditing={submit}
                            style={styles.input}
                        />

                        <View style={styles.errorSlot}>
                            {!!error && (
                                <Text
                                    accessibilityRole="alert"
                                    accessibilityLiveRegion="polite"
                                    style={styles.error}
                                >
                                    {error}
                                </Text>
                            )}
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            onPress={submit}
                            style={({ pressed }) => [
                                styles.submit,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Text style={styles.submitText}>
                                {editing ? "Reagendar" : "Agendar"}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    screen: { flex: 1, backgroundColor: colors.white },
    header: {
        height: 68,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    logoCrop: { width: 94, height: 52, overflow: "hidden" },
    logo: { width: 94, height: 94, top: -18 },
    back: { width: 37, height: 37 },
    backImage: { width: 37, height: 37, transform: [{ scaleX: -1 }] },
    title: { fontFamily: fonts.body, fontSize: 20, color: colors.ink },
    form: { paddingHorizontal: 32, marginTop: 24 },
    info: {
        fontFamily: fonts.body,
        fontSize: 15,
        color: colors.selected,
        marginBottom: 12,
    },
    label: {
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.ink,
        marginTop: 12,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#AAAAAA",
        borderRadius: 8,
        padding: 12,
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.ink,
    },
    errorSlot: { minHeight: 30, marginTop: 8 },
    error: {
        color: colors.error,
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 23,
    },
    submit: {
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.selected,
        alignItems: "center",
        marginTop: 16,
    },
    submitText: { fontFamily: fonts.body, color: colors.white },
});