import { apiFetch } from "@/api/client";
import { Schedule, ScheduleAvailability, Service } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Step = "service" | "schedule" | "slot" | "confirm";

export default function BookScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("service");

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  const [availability, setAvailability] = useState<ScheduleAvailability | null>(
    null,
  );
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Service[]>("/services")
      .then(setServices)
      .catch(() => {})
      .finally(() => setServicesLoading(false));
  }, []);

  function selectService(service: Service) {
    setSelectedService(service);
    setStep("schedule");
    setSchedulesLoading(true);
    apiFetch<Schedule[]>(`/schedules?service_id=${service.id}`)
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setSchedulesLoading(false));
  }

  function selectSchedule(schedule: Schedule) {
    setSelectedSchedule(schedule);
    setStep("slot");
    setAvailabilityLoading(true);
    apiFetch<ScheduleAvailability>(`/schedules/${schedule.id}/availability`)
      .then(setAvailability)
      .catch(() => {})
      .finally(() => setAvailabilityLoading(false));
  }

  function selectTime(time: string) {
    setSelectedTime(time);
    setStep("confirm");
  }

  async function submitBooking() {
    if (!selectedSchedule || !selectTime) return;

    if (!firstName || !lastName || !email || !contactNumber || !address) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          schedule_id: selectedSchedule.id,
          preferred_time: selectedTime,
          first_name: firstName,
          last_name: lastName,
          email,
          gender,
          contact_number: contactNumber,
          address,
        }),
      });

      Alert.alert("Success", "Your appointment has been booked.", [
        { text: "OK", onPress: resetFlow },
      ]);
    } catch (e) {
      Alert.alert(
        "Booking failed",
        e instanceof Error ? e.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetFlow() {
    setStep("service");
    setSelectedService(null);
    setSelectedSchedule(null);
    setAvailability(null);
    setSelectedTime(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setContactNumber("");
    setAddress("");
  }

  // Step: Select Service
  if (step === "service") {
    if (servicesLoading)
      return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>What do you need totday?</Text>
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => selectService(item)}>
              <Ionicons name="medical" size={22} color="#0891b2" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {!!item.description && (
                  <Text style={styles.cardSubtitle}>{item.description}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          )}
        />
      </View>
    );
  }

  // Step: Select Schedule (date/specialist)
  if (step === "schedule") {
    return (
      <View style={styles.container}>
        <BackHeader
          title={selectedService?.name ?? ""}
          onBack={() => setStep("service")}
        />
        {schedulesLoading ? (
          <ActivityIndicator size="large" style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No available dates for this service yet.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => selectSchedule(item)}
              >
                <Ionicons name="calendar" size={20} color="#0891b2" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.date}</Text>
                  <Text style={styles.cardSubtitle}>{item.time_start}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </Pressable>
            )}
          />
        )}
      </View>
    );
  }

  // Step: Select Time Slot
  if (step === "slot") {
    return (
      <View style={styles.container}>
        <BackHeader
          title={selectedSchedule?.date ?? ""}
          onBack={() => setStep("schedule")}
        />
        {availabilityLoading || !availability ? (
          <ActivityIndicator size="large" style={{ flex: 1 }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {availability.day_full && (
              <Text style={styles.fullWarning}>This day is fully booked.</Text>
            )}
            <View style={styles.slotGrid}>
              {availability.slots.map((slot) => (
                <Pressable
                  key={slot.time}
                  disabled={slot.is_full}
                  style={[styles.slotChip, slot.is_full && styles.slotChipFull]}
                  onPress={() => selectTime(slot.time)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      slot.is_full && styles.slotTextFull,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  {slot.is_full && <Text style={styles.fullLabel}>Full</Text>}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  // Step: Confirm
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, gap: 12 }}
    >
      <BackHeader title="Confirm Appointment" onBack={() => setStep("slot")} />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{selectedService?.name}</Text>
        <Text style={styles.summarySubtext}>
          {selectedSchedule?.date} at {selectedTime}
        </Text>
      </View>

      <View style={styles.genderRow}>
        <Pressable
          style={[styles.genderChip, gender === 1 && styles.genderChipActive]}
          onPress={() => setGender(1)}
        >
          <Text
            style={[styles.genderText, gender === 1 && styles.genderTextActive]}
          >
            Male
          </Text>
        </Pressable>
        <Pressable
          style={[styles.genderChip, gender === 2 && styles.genderChipActive]}
          onPress={() => setGender(2)}
        >
          <Text
            style={[styles.genderText, gender === 2 && styles.genderTextActive]}
          >
            Female
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Pressable
        style={styles.button}
        onPress={submitBooking}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.backHeader}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color="#0f172a" />
      </Pressable>
      <Text style={styles.backHeaderTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    padding: 16,
    paddingBottom: 4,
    color: "#0f172a",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  cardTitle: { fontWeight: "700", color: "#0f172a" },
  cardSubtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40 },
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  backHeaderTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  fullWarning: {
    color: "#dc2626",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  genderRow: { flexDirection: "row", gap: 10 },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  genderChipActive: { backgroundColor: "#0891b2" },
  genderText: { color: "#64748b", fontWeight: "600" },
  genderTextActive: { color: "#fff" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    minWidth: 90,
    alignItems: "center",
  },
  slotChipFull: { backgroundColor: "#fee2e2", opacity: 0.6 },
  slotText: { color: "#0891b2", fontWeight: "600" },
  slotTextFull: { color: "#dc2626", textDecorationLine: "line-through" },
  fullLabel: {
    color: "#dc2626",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryCard: { backgroundColor: "#e0f2fe", borderRadius: 12, padding: 14 },
  summaryText: { fontWeight: "700", color: "#0f172a", fontSize: 15 },
  summarySubtext: { color: "#0891b2", marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
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
