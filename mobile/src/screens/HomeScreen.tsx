import { ComponentRef, useRef, useState } from "react";
import { Image } from "expo-image";
import {
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
import { categories, Category, Workout, workouts } from "../data/workouts";
import { Notice } from "../components/Notice";
import { colors, fonts } from "../theme";

const tabs = [
  {
    label: "Inicio",
    icon: require("../../assets/home.svg"),
    width: 25.179,
    height: 25,
  },
  {
    label: "Treinos",
    icon: require("../../assets/dumbbell.svg"),
    width: 33,
    height: 20.104,
  },
  {
    label: "Buscar",
    icon: require("../../assets/search.svg"),
    width: 22.641,
    height: 23,
  },
  {
    label: "Chat",
    icon: require("../../assets/chat.png"),
    width: 26,
    height: 26,
  },
  {
    label: "Conta",
    icon: require("../../assets/account.svg"),
    width: 23,
    height: 25,
  },
] as const;

export function HomeScreen({ onSignOut }: { onSignOut: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gallery = useRef<ComponentRef<typeof ScrollView>>(null);
  const [category, setCategory] = useState<Category>("Geral");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<"categories" | "search" | "account" | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const scale = Math.min(width, 430) / 430;
  const filtered = workouts.filter(
    (workout) =>
      (category === "Geral" || workout.category === category) &&
      workout.title
        .toLocaleLowerCase("pt-BR")
        .includes(query.trim().toLocaleLowerCase("pt-BR")),
  );
  const allVisible = category === "Geral" && !query.trim();
  const contentHeight = allVisible
    ? 1385
    : Math.ceil(filtered.length / 2) * 380 + 20;

  function selectCategory(value: Category) {
    setCategory(value);
    setMenu(null);
    gallery.current?.scrollTo({ y: 0, animated: false });
  }

  function navigate(label: (typeof tabs)[number]["label"]) {
    if (label === "Inicio") {
      setQuery("");
      selectCategory("Geral");
    } else if (label === "Buscar") {
      setMenu("search");
    } else if (label === "Conta") {
      setMenu("account");
    } else {
      setNotice({
        title: label,
        message: `${label === "Treinos" ? "Os planos de treino estarão disponíveis" : "O chat estará disponível"} em uma próxima etapa do aplicativo.`,
      });
    }
  }

  return (
    <View style={styles.screen}>
      <View
        style={{
          height: Math.max(insets.top, 60),
          backgroundColor: colors.white,
        }}
      />
      <View
        style={[
          styles.header,
          { paddingLeft: 23 * scale, paddingRight: 34 * scale },
        ]}
      >
        <View style={[styles.categories, { gap: 12 * scale }]}>
          {(["Geral", "Peito", "Costas"] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: category === item }}
              onPress={() => selectCategory(item)}
              style={styles.category}
            >
              <Text style={styles.categoryText}>{item}</Text>
              {category === item && (
                <Image
                  source={require("../../assets/selected-line.svg")}
                  style={styles.selectedLine}
                  contentFit="fill"
                />
              )}
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mais categorias"
            onPress={() => setMenu("categories")}
            style={styles.moreCategories}
          >
            <Text style={styles.categoryText}>...</Text>
          </Pressable>
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
      {(query || !["Geral", "Peito", "Costas"].includes(category)) && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar filtros"
          onPress={() => {
            setQuery("");
            selectCategory("Geral");
          }}
        >
          <Text style={styles.filterLabel}>{query || category} · Limpar</Text>
        </Pressable>
      )}
      <ScrollView
        ref={gallery}
        style={styles.gallery}
        contentContainerStyle={{ minHeight: contentHeight * scale }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((workout, index) => {
          const x = allVisible ? workout.x : index % 2 === 0 ? 7 : 220;
          const y = allVisible ? workout.y : Math.floor(index / 2) * 380 + 9;
          return (
            <View
              key={workout.id}
              style={[
                styles.tile,
                {
                  left: x * scale,
                  top: y * scale,
                  width: workout.width * scale,
                  height: workout.height * scale,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver ${workout.title}`}
                onPress={() => setSelectedWorkout(workout)}
                style={styles.fill}
              >
                <Image
                  source={workout.image}
                  contentFit="cover"
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: `${workout.imageWidth * 100}%`,
                    left: `${workout.imageLeft * 100}%`,
                  }}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Opções de ${workout.title}`}
                onPress={() => setSelectedWorkout(workout)}
                style={styles.options}
              >
                <Text style={styles.dots}>...</Text>
              </Pressable>
            </View>
          );
        })}
        {!filtered.length && (
          <Text style={styles.empty}>Nenhum treino encontrado.</Text>
        )}
      </ScrollView>
      <View
        style={[
          styles.navigation,
          { paddingBottom: Math.max(insets.bottom, 9) },
        ]}
      >
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.label}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: index === 0 }}
            onPress={() => navigate(tab.label)}
            style={({ pressed }) => [
              styles.tab,
              index === 0 && styles.activeTab,
              pressed && { opacity: 0.65 },
            ]}
          >
            <View style={styles.iconSlot}>
              <Image
                source={tab.icon}
                style={{ width: tab.width, height: tab.height }}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  fontFamily:
                    index === 0 || index === 4 ? fonts.navigation : fonts.body,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {(menu || selectedWorkout) && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => {
            setMenu(null);
            setSelectedWorkout(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View accessibilityViewIsModal style={styles.sheet}>
              {menu === "categories" && (
                <>
                  <Text accessibilityRole="header" style={styles.sheetTitle}>
                    Categorias
                  </Text>
                  {categories.map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      onPress={() => selectCategory(item)}
                      style={styles.sheetAction}
                    >
                      <Text style={styles.sheetText}>{item}</Text>
                    </Pressable>
                  ))}
                </>
              )}
              {menu === "search" && (
                <>
                  <Text accessibilityRole="header" style={styles.sheetTitle}>
                    Buscar treinos
                  </Text>
                  <TextInput
                    accessibilityLabel="Procure treinos"
                    placeholder="Procure treinos"
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    returnKeyType="search"
                    onSubmitEditing={() => {
                      setMenu(null);
                      gallery.current?.scrollTo({ y: 0 });
                    }}
                    style={styles.searchInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setMenu(null);
                      gallery.current?.scrollTo({ y: 0 });
                    }}
                    style={styles.sheetAction}
                  >
                    <Text style={styles.sheetText}>Ver resultados</Text>
                  </Pressable>
                </>
              )}
              {menu === "account" && (
                <>
                  <Text accessibilityRole="header" style={styles.sheetTitle}>
                    Conta
                  </Text>
                  <Text style={styles.sheetText}>Sessão de demonstração</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={onSignOut}
                    style={styles.sheetAction}
                  >
                    <Text style={styles.sheetText}>Sair</Text>
                  </Pressable>
                </>
              )}
              {selectedWorkout && (
                <>
                  <Text accessibilityRole="header" style={styles.sheetTitle}>
                    {selectedWorkout.title}
                  </Text>
                  <Text style={styles.sheetText}>
                    {selectedWorkout.category}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const id = selectedWorkout.id;
                      setSaved((current) =>
                        current.includes(id)
                          ? current.filter((value) => value !== id)
                          : [...current, id],
                      );
                    }}
                    style={styles.sheetAction}
                  >
                    <Text style={styles.sheetText}>
                      {saved.includes(selectedWorkout.id)
                        ? "Remover dos salvos"
                        : "Salvar treino"}
                    </Text>
                  </Pressable>
                </>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setMenu(null);
                  setSelectedWorkout(null);
                }}
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
  fill: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingLeft: 23,
    paddingRight: 34,
  },
  categories: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    gap: 12,
  },
  category: { minHeight: 44, justifyContent: "center" },
  categoryText: { fontFamily: fonts.category, fontSize: 16, color: colors.ink },
  selectedLine: {
    position: "absolute",
    bottom: 9,
    left: 0,
    width: 44,
    height: 1,
  },
  moreCategories: { minWidth: 30, minHeight: 44, justifyContent: "center" },
  logoCrop: { width: 94, height: 52, overflow: "hidden" },
  logo: { width: 94, height: 94, top: -18 },
  filterLabel: {
    fontFamily: fonts.body,
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: colors.selected,
  },
  gallery: { flex: 1, marginLeft: 6, marginRight: 5 },
  tile: {
    position: "absolute",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.navigation,
  },
  options: {
    position: "absolute",
    bottom: 10,
    right: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    color: colors.white,
    fontFamily: fonts.category,
    fontSize: 36,
    lineHeight: 44,
    marginTop: -12,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 16,
  },
  navigation: {
    backgroundColor: colors.navigation,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 8,
    paddingHorizontal: 20,
    minHeight: 74,
  },
  tab: {
    flex: 1,
    maxWidth: 67,
    height: 57,
    alignItems: "center",
    paddingTop: 7,
    borderRadius: 8,
  },
  activeTab: { backgroundColor: colors.selected },
  iconSlot: { height: 27, justifyContent: "flex-start", alignItems: "center" },
  tabLabel: { fontSize: 13, color: colors.white, lineHeight: 19 },
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
  sheetAction: { minHeight: 48, justifyContent: "center" },
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
