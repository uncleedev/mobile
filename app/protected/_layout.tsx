import { useAuthStore } from "@/stores/auth-store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ProtectedLayout() {
  const { session, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth/login");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0F6B3E" />
      </View>
    );
  }

  if (!session) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
