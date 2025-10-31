import { useDocumentStore } from "@/stores/document-store";
import { useSessionStore } from "@/stores/session-store";
import { useUserStore } from "@/stores/user-store";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function TabsLayout() {
  const { fetchAllUsers, fetchLogonUser, subscribeToUsers } = useUserStore();
  const { fetchAllSessions, subscribeToSessions } = useSessionStore();
  const { fetchAllDocuments, subscribeToDocuments } = useDocumentStore();

  useEffect(() => {
    let unsubscribeDocuments: (() => void) | null = null;
    let unsubscribeSessions: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    const initializeData = async () => {
      try {
        await Promise.all([
          fetchAllUsers(),
          fetchLogonUser(),
          fetchAllSessions(),
          fetchAllDocuments(),
        ]);

        // 🟢 Set up realtime subscriptions
        unsubscribeDocuments = subscribeToDocuments();
        unsubscribeSessions = subscribeToSessions();
        unsubscribeUsers = subscribeToUsers();
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeData();

    return () => {
      if (unsubscribeDocuments) unsubscribeDocuments();
      if (unsubscribeSessions) unsubscribeSessions();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F6B3E",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: "Documents",
            tabBarIcon: ({ color }) => (
              <Feather name="file-text" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: "Session",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="event" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Feather name="settings" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: "500",
  },
});
