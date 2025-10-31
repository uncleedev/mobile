import { useAuthStore } from "@/stores/auth-store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { session, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/protected/dashboard");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0F6B3E" />
      </View>
    );
  }

  if (session) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
