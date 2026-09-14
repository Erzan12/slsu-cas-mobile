import { StyleSheet, Text, View } from "react-native";

export default function BookScreen() {
  return (
    <View>
      <Text style={styles.container}>Booking flow coming next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#94a3b8" },
});
