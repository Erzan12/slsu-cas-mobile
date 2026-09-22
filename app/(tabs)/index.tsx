import { apiFetch, UnauthenticatedError } from "@/api/client";
import { Appointment, PaginatedResponse } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  // Patient state
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
    null,
  );

  // Specialist state
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  // Admin state
  const [totalToday, setTotalToday] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;

    try {
      const res =
        await apiFetch<PaginatedResponse<Appointment>>("/appointments");
      const today = new Date().toISOString().slice(0, 10);

      if (user.role === "patient") {
        const upcoming = res.data
          .filter(
            (a) =>
              [0, 1].includes(a.status) &&
              a.schedule &&
              a.schedule.date >= today,
          )
          .sort((a, b) => (a.schedule!.date > b.schedule!.date ? 1 : -1));
        setNextAppointment(upcoming[0] ?? null);
      }

      if (user.role === "specialist") {
        setPendingCount(res.data.filter((a) => a.status === 0).length);
        setTodayCount(
          res.data.filter(
            (a) => a.schedule?.date === today && [0, 1].includes(a.status),
          ).length,
        );
      }

      if (user.role === "admin") {
        const today = new Date().toISOString().slice(0, 10);
        setTotalToday(
          res.data.filter(
            (a) => a.schedule?.date === today && [0, 1].includes(a.status),
          ).length,
        );
        setTotalPending(res.data.filter((a) => a.status === 0).length);
      }
    } catch (e) {
      if (e instanceof UnauthenticatedError) {
        router.replace("/(auth)/login");
        return;
      }
      // any other error — fail quietly on Home rather than crashing the screen
      console.warn("Failed to load appointments:", e);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

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
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <>
          {user?.role === "patient" && (
            <>
              <Pressable
                style={styles.primaryAction}
                onPress={() => router.push("/(tabs)/book")}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>
                  Book an Appointment
                </Text>
              </Pressable>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Next Appointment</Text>
                {nextAppointment ? (
                  <>
                    <Text style={styles.nextService}>
                      {nextAppointment.schedule?.service?.name}
                    </Text>
                    <Text style={styles.nextDate}>
                      {nextAppointment.schedule?.date} at{" "}
                      {nextAppointment.preferred_time?.slice(0, 5)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.emptyText}>
                    No upcoming appointments.
                  </Text>
                )}
              </View>
            </>
          )}

          {user?.role === "specialist" && (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{pendingCount}</Text>
                  <Text style={styles.statLabel}>Pending Approval</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{todayCount}</Text>
                  <Text style={styles.statLabel}>Today's Appointments</Text>
                </View>
              </View>

              <Pressable
                style={styles.primaryAction}
                onPress={() => router.push("/(tabs)/appointments")}
              >
                <Ionicons name="clipboard" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>
                  Review Appointments
                </Text>
              </Pressable>
            </>
          )}

          {user?.role === "admin" && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalToday}</Text>
                <Text style={styles.statLabel}>Appointments Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalPending}</Text>
                <Text style={styles.statLabel}>Pending Clinic-Wide</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
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
  primaryAction: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#0891b2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryActionText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  nextService: { fontWeight: "700", fontSize: 16, color: "#0f172a" },
  nextDate: { color: "#64748b", marginTop: 2 },
  emptyText: { color: "#94a3b8" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 1,
  },
  statNumber: { fontSize: 28, fontWeight: "800", color: "#0891b2" },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
