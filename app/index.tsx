import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/images/home_img.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.25)", "transparent"]}
            style={styles.imageOverlay}
          />
        </View>

        {/* Gradient Divider */}
        <LinearGradient
          colors={["#d4f1e0", "#a6e1a1", "#0F6B3E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welcome to SBORR</Text>
          <Text style={styles.subtitle}>Municipality of Montalban</Text>
        </View>

        {/* Button */}
        <View style={styles.buttonWrapper}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8}>
              <Text style={styles.btnPrimaryText}>Continue</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Terms & Policies */}
        <Text style={styles.termsText}>
          By continuing, you agree to SBORR's{" "}
          <Link href="/terms" asChild>
            <Text style={styles.link}>Terms & Conditions</Text>
          </Link>{" "}
          and{" "}
          <Link href="/privacy" asChild>
            <Text style={styles.link}>Privacy Policy</Text>
          </Link>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Root container
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 60,
  },

  // Hero image
  imageWrapper: {
    width: screenWidth,
    height: 320,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Divider
  gradientBar: {
    width: "100%",
    height: 18,
    marginVertical: 24,
  },

  // Welcome section
  welcomeSection: {
    alignItems: "center",
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F6B3E",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#0F6B3E",
    textAlign: "center",
    opacity: 0.85,
  },

  // Button
  buttonWrapper: {
    width: "85%",
    marginBottom: 40,
  },
  btnPrimary: {
    backgroundColor: "#0F6B3E",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#0F6B3E",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
    marginHorizontal: 32,
    marginBottom: 20,
  },
  link: {
    color: "#0F6B3E",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
