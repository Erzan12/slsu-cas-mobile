import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  function confirmLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.display_name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <Pressable onPress={confirmLogout} hitSlop={12}>
          <Ionicons name="log-out-outline" size={26} color="#dc2626" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: { fontSize: 15, color: "#64748b" },
  name: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  role: {
    fontSize: 13,
    color: "#0891b2",
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 2,
  },
});
