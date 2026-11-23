import { ComponentRef, useRef, useState } from "react";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
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
import { Notice } from "../components/Notice";
import { colors, fonts } from "../theme";

type Props = { onEnterDemo: () => void };

export function LoginScreen({ onEnterDemo }: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const compact = Math.max(0.65, Math.min(height / 932, 1));
  const fieldWidth = Math.min(width, 430) - 74;

  function enter() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Erro: informe um e-mail válido.");
      return;
    }
    if (!password.trim()) {
      setError("Erro: senha inválida. Tente novamente");
      passwordInput.current?.focus();
      return;
    }
    Keyboard.dismiss();
    setPassword("");
    onEnterDemo();
  }

  function reset() {
    Keyboard.dismiss();
    setEmail("");
    setPassword("");
    setError("");
    setVisible(false);
  }

  return (
    <View style={styles.screen}>
      <Image
        source={require("../../assets/login-background.png")}
        style={styles.background}
        contentFit="cover"
      />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            minHeight: height,
            paddingBottom: Math.max(insets.bottom, 32),
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar e limpar o formulário"
            hitSlop={8}
            onPress={reset}
            style={[
              styles.back,
              { marginTop: Math.max(insets.top, 60 * compact) + 15 },
            ]}
          >
            <Image
              source={require("../../assets/back.png")}
              style={styles.backImage}
            />
          </Pressable>
          <View
            style={[
              styles.form,
              { marginTop: 164 * compact, width: fieldWidth },
            ]}
          >
            <Text style={styles.label}>Digite seu e-mail</Text>
            <View style={styles.inputShell}>
              <BlurView
                intensity={12}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={require("../../assets/input-background.svg")}
                style={StyleSheet.absoluteFill}
                contentFit="fill"
              />
              <TextInput
                accessibilityLabel="Digite seu e-mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                placeholder="roberto.almeida@gmail.com"
                placeholderTextColor={colors.white}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
                style={styles.input}
              />
            </View>
            <Text style={[styles.label, styles.passwordLabel]}>Senha</Text>
            <View style={styles.inputShell}>
              <BlurView
                intensity={12}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={require("../../assets/input-background.svg")}
                style={StyleSheet.absoluteFill}
                contentFit="fill"
              />
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Senha"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                placeholder="**********"
                placeholderTextColor={colors.white}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={enter}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
                accessibilityState={{ selected: visible }}
                onPress={() => setVisible(!visible)}
                style={styles.eye}
              >
                <Image
                  source={require("../../assets/eye-off.svg")}
                  style={styles.eyeImage}
                />
              </Pressable>
            </View>
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
              onPress={() => setRecoveryOpen(true)}
              hitSlop={8}
              style={styles.recovery}
            >
              <Text style={styles.recoveryText}>Esqueceu a senha ?</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={enter}
            style={({ pressed }) => [
              styles.enter,
              { marginTop: 181 * compact, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <BlurView
              intensity={25}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <Image
              source={require("../../assets/button-glow.svg")}
              style={styles.buttonGlow}
            />
            <Text style={styles.enterText}>Entrar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      {recoveryOpen && (
        <Notice
          title="Recuperar senha"
          message="A recuperação de senha estará disponível quando o serviço de autenticação for conectado."
          onClose={() => setRecoveryOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.white },
  background: { ...StyleSheet.absoluteFill, opacity: 0.9 },
  back: { marginLeft: 18, width: 37, height: 37 },
  backImage: { width: 37, height: 37, transform: [{ scaleX: -1 }] },
  form: { marginLeft: 32 },
  label: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 30,
    marginLeft: 13,
  },
  inputShell: {
    height: 46.341,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 4,
  },
  input: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 19,
    paddingHorizontal: 19,
    paddingVertical: 0,
  },
  passwordLabel: { marginTop: 18 },
  passwordInput: { paddingRight: 64, fontSize: 23 },
  eye: {
    zIndex: 2,
    position: "absolute",
    right: 7,
    top: 0,
    width: 48,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeImage: { width: 33, height: 25 },
  errorSlot: { minHeight: 30 },
  error: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    paddingLeft: 12,
  },
  recovery: { alignSelf: "flex-start", marginLeft: 8 },
  recoveryText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: 0.18,
    textDecorationLine: "underline",
  },
  enter: {
    width: 142,
    height: 45,
    borderRadius: 50,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.45)",
  },
  buttonGlow: {
    position: "absolute",
    width: 32,
    height: 32,
    left: 55,
    top: 7,
    opacity: 0.1,
  },
  enterText: {
    color: colors.white,
    fontFamily: fonts.button,
    fontSize: 18,
    letterSpacing: 0.18,
  },
});
