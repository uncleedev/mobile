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

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧭 Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* 📜 Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.paragraph}>
          Welcome to SBORR (Sangguniang Bayan Online Record Repository). By
          accessing or using our mobile application and related services, you
          agree to comply with and be bound by these Terms and Conditions.
        </Text>

        <Text style={styles.heading}>1. Use of the Application</Text>
        <Text style={styles.paragraph}>
          SBORR is provided for authorized council members and staff to manage,
          access, and record legislative documents and related data. You agree
          to use the app only for lawful purposes and in accordance with
          institutional policies.
        </Text>

        <Text style={styles.heading}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your
          account credentials. Any activity that occurs under your account is
          your responsibility. Report any unauthorized access immediately.
        </Text>

        <Text style={styles.heading}>3. Data Accuracy</Text>
        <Text style={styles.paragraph}>
          You agree to provide accurate and up-to-date information. SBORR
          reserves the right to suspend or terminate accounts found to be
          providing false or misleading information.
        </Text>

        <Text style={styles.heading}>4. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, trademarks, and data within this application are owned or
          licensed by SBORR and are protected by applicable copyright and
          intellectual property laws.
        </Text>

        <Text style={styles.heading}>5. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          SBORR and its developers shall not be liable for any direct or
          indirect damages arising from the use or inability to use this
          application, including data loss or service interruptions.
        </Text>

        <Text style={styles.heading}>6. Modifications</Text>
        <Text style={styles.paragraph}>
          We reserve the right to update or modify these Terms at any time. Any
          changes will be communicated within the application or through
          official notice.
        </Text>

        <Text style={styles.heading}>7. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, please contact the SBORR
          Administrator or your local Sangguniang Bayan IT officer.
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
    gap: 6,
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
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
