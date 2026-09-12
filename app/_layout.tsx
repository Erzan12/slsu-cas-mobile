import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { router, Stack, useSegments } from "expo-router";
import { useEffect } from "react";

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/tabs");
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
