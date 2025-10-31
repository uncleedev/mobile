import { useAuthStore } from "@/stores/auth-store";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChangePassword() {
  const router = useRouter();
  const { changePassword, loading } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Your password has been updated successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update password.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#0F6B3E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.form}>
            {/* Current */}
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showCurrent ? "eye-off" : "eye"}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* New */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showNew ? "eye-off" : "eye"}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm */}
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showConfirm ? "eye-off" : "eye"}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* Save */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F6B3E",
  },
  form: { marginTop: 10 },
  label: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 10,
  },
  passwordBox: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#222",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#0F6B3E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
