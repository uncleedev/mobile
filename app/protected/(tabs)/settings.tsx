import { useAuthStore } from "@/stores/auth-store";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingScreen() {
  const router = useRouter();
  const { signout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signout();
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.content}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.optionBox}
          onPress={() => router.push("/protected/profile")}
        >
          <MaterialIcons name="person" size={20} color="#0F6B3E" />
          <Text style={styles.optionText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionBox}
          onPress={() => router.push("/protected/change-passord")}
        >
          <Feather name="lock" size={20} color="#0F6B3E" />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity
          style={styles.optionBox}
          onPress={() => setAboutVisible(true)}
        >
          <Feather name="info" size={20} color="#0F6B3E" />
          <Text style={styles.optionText}>About</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.optionBox, styles.logoutBox]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="log-out" size={20} color="#fff" />
              <Text style={[styles.optionText, { color: "#fff" }]}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>About SBORR</Text>

              <Text style={styles.modalDesc}>
                SBORR (Sangguniang Bayan Ordinance and Resolution Repository) is
                a comprehensive system designed for councilors and staff to
                manage, view, and publicize legislative documents. The system
                consists of mobile, web and desktop applications that allow
                seamless access to ordinances, resolutions, and session
                activities.
              </Text>

              <Text style={[styles.sectionTitleModal, { marginTop: 20 }]}>
                Developers & Contributors
              </Text>

              <View style={styles.developersRow}>
                {[
                  {
                    name: "Jhon Brian Arce",
                    role: "Programmer",
                    avatar: require("@/assets/images/avatar.webp"),
                  },
                  {
                    name: "Emmanuel Pornel",
                    role: "Programmer",
                    avatar: require("@/assets/images/avatar.webp"),
                  },
                  {
                    name: "Domgy Anne Espiritu",
                    role: "Documentation",
                    avatar: require("@/assets/images/avatar2.webp"),
                  },
                  {
                    name: "Jhon Cristian Alag",
                    role: "Documentation",
                    avatar: require("@/assets/images/avatar.webp"),
                  },
                ].map((person, index) => (
                  <View key={index} style={styles.devCard}>
                    <Image source={person.avatar} style={styles.devAvatar} />
                    <Text style={styles.devName}>{person.name}</Text>
                    <Text style={styles.devRole}>{person.role}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAboutVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0F6B3E" },
  content: { flex: 1 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginVertical: 10,
  },
  sectionTitleModal: { fontSize: 14, fontWeight: "600", color: "#333" },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 10,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  logoutBox: {
    backgroundColor: "#B3261E",
    justifyContent: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
    elevation: 5,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#0F6B3E",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    textAlign: "justify",
  },

  developersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  devCard: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  devAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  devName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#0F6B3E",
    textAlign: "center",
  },
  devRole: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#0F6B3E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
