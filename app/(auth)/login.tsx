import { apiFetchPublic } from "@/api/client";
import { PublicAvailabilityResponse } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrap}>
        <Ionicons name="medkit" size={56} color="#0891b2" />
      </View>
      <Text style={styles.title}>SLSU Clinic</Text>
      <Text style={styles.subtitle}>Appointment System</Text>

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

      <View style={styles.divider} />

      <Text style={styles.previewTitle}>Upcoming Availability</Text>
      <Text style={styles.previewSubtitle}>
        See what's open before you sign in.
      </Text>

      {availabilityLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : days.length === 0 ? (
        <Text style={styles.emptyText}>
          No availabilityin the next few days.
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
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 24, gap: 12, paddingBottom: 60 },
  iconWrap: { alignItems: "center", marginTop: 20, marginBottom: 4 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
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
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "red", textAlign: "center" },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 24 },
  previewTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  previewSubtitle: { color: "#64748b", fontSize: 13, marginBottom: 16 },
  emptyText: { color: "#94a3b8", textAlign: "center", marginTop: 12 },
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
});
