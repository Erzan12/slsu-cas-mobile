import { apiFetchPublic } from "@/api/client";
import { PublicAvailabilityResponse } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [availability, setAvailability] =
    useState<PublicAvailabilityResponse | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  useEffect(() => {
    apiFetchPublic<PublicAvailabilityResponse>("/public/availability")
      .then(setAvailability)
      .catch(() => {})
      .finally(() => setAvailabilityLoading(false));
  }, []);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      setLoginModalVisible(false);
      router.replace("/(tabs)");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Login failed. Check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const days = availability ? Object.keys(availability) : [];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="medkit" size={26} color="#0891b2" />
          <Text style={styles.topBarTitle}>SLSU Clinic</Text>
        </View>
        <Pressable
          style={styles.loginIconButton}
          onPress={() => setLoginModalVisible(true)}
        >
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.loginIconText}>Log In</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.previewTitle}>Upcoming Availability</Text>
        <Text style={styles.previewSubtitle}>
          See what's open before you sign in.
        </Text>

        {availabilityLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : days.length === 0 ? (
          <Text style={styles.emptyText}>
            No availability in the next few days.
          </Text>
        ) : (
          days.map((date) => (
            <View key={date} style={styles.dayBlock}>
              <Text style={styles.dayLabel}>{date}</Text>
              {availability![date].map((entry) => (
                <View key={entry.schedule_id} style={styles.entryCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryService}>{entry.service}</Text>
                    <Text style={styles.entrySpecialist}>
                      {entry.specialist_name ?? "TBA"}
                    </Text>
                    <Text style={styles.entryTime}>
                      {entry.time_start.slice(0, 5)} -{" "}
                      {entry.time_end.slice(0, 5)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.remainingBadge,
                      entry.is_full && styles.fullBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.remainingText,
                        entry.is_full && styles.fullText,
                      ]}
                    >
                      {entry.is_full ? "Full" : `${entry.remaining} open`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={loginModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log In</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setLoginModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    elevation: 2,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  topBarTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  loginIconButton: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#0891b2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginIconText: { color: "#fff", fontWeight: "600" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  previewTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  previewSubtitle: { color: "#64748b", fontSize: 13, marginBottom: 16 },
  emptyText: { color: "#94a3b8", textAlign: "center", marginTop: 20 },
  dayBlock: { marginBottom: 16 },
  dayLabel: { fontWeight: "700", color: "#0891b2", marginBottom: 8 },
  entryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    alignItems: "center",
  },
  entryService: { fontWeight: "700", color: "#0f172a" },
  entrySpecialist: { color: "#64748b", fontSize: 13, marginTop: 1 },
  entryTime: { color: "#94a3b8", fontSize: 12, marginTop: 1 },
  remainingBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  fullBadge: { backgroundColor: "#fee2e2" },
  remainingText: { color: "#059669", fontWeight: "700", fontSize: 12 },
  fullText: { color: "#dc2626" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0891b2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "red", textAlign: "center" },
  cancelButton: { padding: 10, alignItems: "center" },
  cancelText: { color: "#64748b", fontWeight: "600" },
});
