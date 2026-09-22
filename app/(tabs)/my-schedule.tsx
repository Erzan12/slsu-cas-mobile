import { apiFetch } from "@/api/client";
import { Schedule, Service } from "@/api/types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MyScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [timeStart, setTimeStart] = useState<Date | null>(null);
  const [timeEnd, setTimeEnd] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [quota, setQuota] = useState("15");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [scheduleRes, serviceRes] = await Promise.all([
      apiFetch<Schedule[]>("/schedules?mine=true"),
      apiFetch<Service[]>("/services"),
    ]);
    (setSchedules(scheduleRes), setServices(serviceRes));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  function formatDate(d: Date) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function formatTime(d: Date) {
    return d.toTimeString().slice(0, 5); // HH:MM
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function resetForm() {
    setSelectedService(null);
    setDate(null);
    setTimeStart(null);
    setTimeEnd(null);
    setQuota("15");
  }

  async function submitSchedule() {
    if (!selectedService || !date || !timeStart || !timeEnd || !quota) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (timeEnd <= timeStart) {
      Alert.alert("Invalid time range", "End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/schedules", {
        method: "POST",
        body: JSON.stringify({
          service_id: selectedService.id,
          date: formatDate(date),
          time_start: formatTime(timeStart),
          time_end: formatTime(timeEnd),
          quota: Number(quota),
        }),
      });

      setModalVisible(false);
      resetForm();
      load();
      Alert.alert("Success", "Availability added.");
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not create schedule.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Availability</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text style={styles.empty}>No availability set yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.service}>{item.service?.name}</Text>
              {!item.is_active && (
                <Text style={styles.inactiveBadge}>Inactive</Text>
              )}
            </View>
            <Text style={styles.date}>
              {item.date} · {item.time_start.slice(0, 5)} -{" "}
              {item.time_end.slice(0, 5)}
            </Text>
            <Text style={styles.quota}>Quota: {item.quota}</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalCard}
            contentContainerStyle={{ gap: 12 }}
          >
            <Text style={styles.modalTitle}>Add Availability</Text>

            <Text style={styles.label}>Service</Text>
            <View style={styles.serviceGrid}>
              {services.map((s) => (
                <Pressable
                  key={s.id}
                  style={[
                    styles.serviceChip,
                    selectedService?.id === s.id && styles.serviceChipActive,
                  ]}
                  onPress={() => setSelectedService(s)}
                >
                  <Text
                    style={[
                      styles.serviceChipText,
                      selectedService?.id === s.id &&
                        styles.serviceChipTextActive,
                    ]}
                  >
                    {s.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Date</Text>
            <Pressable
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date ? formatDate(date) : "Select date"}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}

            <Text style={styles.label}>Time Start</Text>
            <Pressable
              style={styles.input}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>
                {timeStart ? formatTime(timeStart) : "Select start time"}
              </Text>
            </Pressable>
            {showStartPicker && (
              <DateTimePicker
                value={timeStart ?? new Date()}
                mode="time"
                onChange={(_, selected) => {
                  setShowStartPicker(false);
                  if (selected) setTimeStart(selected);
                }}
              />
            )}

            <Text style={styles.label}>Time End</Text>
            <Pressable
              style={styles.input}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>{timeEnd ? formatTime(timeEnd) : "Select end time"}</Text>
            </Pressable>
            {showEndPicker && (
              <DateTimePicker
                value={timeEnd ?? new Date()}
                mode="time"
                onChange={(_, selected) => {
                  setShowEndPicker(false);
                  if (selected) setTimeEnd(selected);
                }}
              />
            )}

            <Text style={styles.label}>Daily Quota</Text>
            <TextInput
              style={styles.input}
              value={quota}
              onChangeText={setQuota}
              keyboardType="number-pad"
            />

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={submitSchedule}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 0,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  addButton: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "#0891b2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
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
  },
  service: { fontWeight: "700", color: "#0f172a" },
  inactiveBadge: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  date: { color: "#64748b", fontSize: 13, marginTop: 4 },
  quota: { color: "#0891b2", fontSize: 13, marginTop: 2, fontWeight: "600" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 4,
    color: "#0f172a",
  },
  label: { fontWeight: "600", color: "#334155", fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  serviceChipActive: { backgroundColor: "#0891b2" },
  serviceChipText: { color: "#64748b", fontWeight: "600", fontSize: 13 },
  serviceChipTextActive: { color: "#fff" },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  modalCancelButton: { backgroundColor: "#f1f5f9" },
  modalCancelText: { color: "#64748b", fontWeight: "600" },
  modalSubmitButton: { backgroundColor: "#0891b2" },
  modalSubmitText: { color: "#fff", fontWeight: "600" },
});
