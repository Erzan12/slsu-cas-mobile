import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiFetch } from "../../../api/client";

const CRITERIA: { key: string; label: string }[] = [
  { key: "responsiveness", label: "Responsiveness" },
  { key: "reliability", label: "Reliability" },
  { key: "access_and_facility", label: "Access & Facility" },
  { key: "costs", label: "Costs" },
  { key: "integrity", label: "Integrity" },
  { key: "communication", label: "Communication" },
  { key: "assurance", label: "Assurance" },
  { key: "outcome", label: "Outcome" },
];

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
          <Ionicons
            name={n <= value ? "star" : "star-outline"}
            size={26}
            color="#f59e0b"
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function RateAppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map((c) => [c.key, 0])),
  );
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setRating(key: string, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const unrated = CRITERIA.find((c) => ratings[c.key] === 0);
    if (unrated) {
      Alert.alert(
        "Incomplete",
        `Please rate "${unrated.label}" before submitting.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/appointments/${id}/rating`, {
        method: "POST",
        body: JSON.stringify({ ...ratings, suggestion: suggestion || null }),
      });

      Alert.alert("Thank You", "Your feedback has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not submit rating.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, gap: 18 }}
    >
      <Stack.Screen options={{ title: "Rate Your Visit" }} />

      {CRITERIA.map((c) => (
        <View key={c.key} style={styles.row}>
          <Text style={styles.label}>{c.label}</Text>
          <StarRow
            value={ratings[c.key]}
            onChange={(v) => setRating(c.key, v)}
          />
        </View>
      ))}

      <View>
        <Text style={styles.label}>Suggestions (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Anything we can improve?"
          value={suggestion}
          onChangeText={setSuggestion}
          multiline
          numberOfLines={4}
        />
      </View>

      <Pressable style={styles.button} onPress={submit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Rating</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  row: { gap: 8 },
  label: { fontWeight: "600", color: "#0f172a", fontSize: 14 },
  textArea: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0891b2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
