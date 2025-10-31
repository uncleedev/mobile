import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          SBORR (Sangguniang Bayan Online Record Repository) values your
          privacy. This Privacy Policy explains how we collect, use, and protect
          your personal information when you use our app and related services.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly, such as your name,
          email address, and login credentials. The system may also record
          device information, usage logs, and activity history for security and
          audit purposes.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your data is used to authenticate your access, manage legislative
          records, improve system performance, and ensure accountability in
          council operations. We do not sell or share your data for commercial
          purposes.
        </Text>

        <Text style={styles.heading}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          SBORR uses secure cloud infrastructure (Supabase) to store your
          information. All data transmissions are encrypted, and access is
          restricted to authorized personnel only.
        </Text>

        <Text style={styles.heading}>4. Data Retention</Text>
        <Text style={styles.paragraph}>
          Records and account data are retained as required by local government
          policies or until your account is terminated. Deleted data may remain
          in backups for a limited period.
        </Text>

        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You may request to view, update, or delete your personal information
          in accordance with the Data Privacy Act of 2012 (Republic Act No.
          10173). Contact your system administrator for assistance.
        </Text>

        <Text style={styles.heading}>6. Policy Updates</Text>
        <Text style={styles.paragraph}>
          SBORR may update this Privacy Policy periodically. Continued use of
          the app after changes are posted constitutes acceptance of the revised
          policy.
        </Text>

        <Text style={styles.heading}>7. Contact Information</Text>
        <Text style={styles.paragraph}>
          For privacy concerns or requests, please reach out to:
          {"\n"}Email: sborr.montalban@gmail.com
          {"\n"}Address: Montalban Information Technology Office
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#0F6B3E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F6B3E",
    marginTop: 20,
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    lineHeight: 20,
  },
});
