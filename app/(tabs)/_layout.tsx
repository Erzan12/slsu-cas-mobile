import { Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { user } = useAuth();

  const isPatient = user?.role === "patient";
  const isSpecialist = user?.role == "specialist";
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#0891b2" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: "Book",
          href: isPatient ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-appointment"
        options={{
          title: "My Appointment",
          href: isSpecialist ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-schedule"
        options={{
          title: "My Schedule",
          href: isSpecialist ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          href: isSpecialist ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
