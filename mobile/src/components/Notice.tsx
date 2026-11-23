import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

type Props = { title: string; message: string; onClose: () => void };

export function Notice({ title, message, onClose }: Props) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.panel}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Entendi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 28,
  },
  panel: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
  },
  title: { fontFamily: fonts.body, fontSize: 20, marginBottom: 12 },
  message: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24 },
  button: {
    marginTop: 24,
    backgroundColor: colors.selected,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontFamily: fonts.body },
});
