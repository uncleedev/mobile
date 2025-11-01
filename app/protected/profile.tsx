import { useAuthStore } from "@/stores/auth-store";
import { useUserStore } from "@/stores/user-store";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { signout } = useAuthStore();
  const { logonUser, fetchLogonUser, updateUser, loading } = useUserStore();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    bio: "",
    avatarUri: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogonUser();
  }, []);

  useEffect(() => {
    if (logonUser) {
      setForm({
        firstname: logonUser.firstname || "",
        lastname: logonUser.lastname || "",
        bio: logonUser.bio || "",
        avatarUri: logonUser.avatar_url || "",
      });
    }
  }, [logonUser]);

  if (loading || !logonUser) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F6B3E" />
      </View>
    );
  }

  // 📸 Pick new avatar
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm({ ...form, avatarUri: result.assets[0].uri });
    }
  };

  // 💾 Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUser(
        {
          firstname: form.firstname,
          lastname: form.lastname,
          bio: form.bio,
        },
        form.avatarUri !== logonUser.avatar_url ? form.avatarUri : undefined
      );
      Alert.alert("Success", "Profile updated successfully!");
      setEditMode(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#0F6B3E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Feather
              name={editMode ? "x" : "edit-2"}
              size={20}
              color="#0F6B3E"
            />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity disabled={!editMode} onPress={pickAvatar}>
            <Image
              source={
                form.avatarUri
                  ? { uri: form.avatarUri }
                  : require("@/assets/images/avatar.webp")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {editMode ? (
            <>
              <TextInput
                style={styles.input}
                value={form.firstname}
                onChangeText={(t) => setForm({ ...form, firstname: t })}
                placeholder="First name"
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                value={form.lastname}
                onChangeText={(t) => setForm({ ...form, lastname: t })}
                placeholder="Last name"
                placeholderTextColor="#999"
              />
            </>
          ) : (
            <Text style={styles.name}>
              {logonUser.firstname} {logonUser.lastname}
            </Text>
          )}

          {/* Email */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.infoText}>{logonUser.email}</Text>
          </View>

          {/* Role */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.infoText}>
              {logonUser.role ? logonUser.role : "Councilor"}
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Bio</Text>
            {editMode ? (
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={form.bio}
                onChangeText={(t) => setForm({ ...form, bio: t })}
                placeholder="Write something about yourself..."
                placeholderTextColor="#999"
                multiline
              />
            ) : (
              <Text style={styles.infoText}>
                {logonUser.bio ? logonUser.bio : "No bio provided."}
              </Text>
            )}
          </View>

          {/* Buttons */}
          {editMode ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#0F6B3E" }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.actionText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#B3261E" }]}
              onPress={async () => {
                try {
                  await signout();
                  router.replace("/");
                } catch (error: any) {
                  Alert.alert("Error", error.message);
                }
              }}
            >
              <Text style={styles.actionText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F6B3E",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#0F6B3E",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F6B3E",
    textAlign: "center",
    marginBottom: 20,
  },
  infoSection: {
    width: "100%",
    alignItems: "center",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#e6f4ea",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F6B3E",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0F6B3E",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#0F6B3E",
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  actionBtn: {
    marginTop: 30,
    padding: 14,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
