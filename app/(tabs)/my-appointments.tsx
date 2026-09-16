import { apiFetch } from "@/api/client";
import { Appointment, PaginatedResponse } from "@/api/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> =
  {
    0: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
    1: { label: "Approved", color: "#2563eb", bg: "#dbeafe" },
    2: { label: "To Be Rated", color: "#7c3aed", bg: "#eded9fe" },
    3: { label: "Done", color: "#059669", bg: "d1fae5" },
    4: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
    5: { label: "Cancelled", color: "#64748b", bg: "#f1f5f9" },
  };

function StatusBadge({ status }: { status: number }) {
  const info = STATUS_MAP[status] ?? STATUS_MAP[0];
  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      <Text style={[styles.badgeText, { color: info.color }]}>
        {info.label}
      </Text>
    </View>
  );
}

export default function MyAppointmentScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch<PaginatedResponse<Appointment>>("/appointments");
    setAppointments(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function confirmCancel(appointment: Appointment) {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/appointments/${appointment.id}/cancel`, {
                method: "POST",
              });
              load();
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof Error
                  ? e.message
                  : "Could not cancel appointment.",
              );
            }
          },
        },
      ],
    );
  }

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text style={styles.empty}>No appointments yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.service}>
                {item.schedule?.service?.name ?? "Appointment"}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.date}>
              {item.schedule?.date} at {item.preferred_time?.slice(0, 5)}
            </Text>

            <View style={styles.actions}>
              {(item.status === 0 || item.status === 1) && (
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => confirmCancel(item)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#dc2626"
                  />
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              )}
              {item.status === 2 && (
                <Pressable
                  style={styles.rateButton}
                  onPress={() =>
                    router.push({
                      pathname: "/appointment/[id]/rate",
                      params: { id: String(item.id) },
                    })
                  }
                >
                  <Ionicons name="star-outline" size={16} color="#fff" />
                  <Text style={styles.rateText}>Rate This Visit</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  service: { fontWeight: "700", fontSize: 15, color: "#0f172a" },
  date: { color: "#64748b", fontSize: 13, marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelButton: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  cancelText: { color: "#dc2626", fontWeight: "600", fontSize: 12 },
  rateButton: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#7c3aed",
  },
  rateText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
});
