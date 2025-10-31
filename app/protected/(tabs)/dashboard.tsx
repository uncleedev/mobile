import { useDocumentStore } from "@/stores/document-store";
import { useSessionStore } from "@/stores/session-store";
import { useUserStore } from "@/stores/user-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function DashboardScreen() {
  const router = useRouter();
  const { logonUser } = useUserStore();
  const { sessions } = useSessionStore();
  const { documents } = useDocumentStore();

  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [nextMeeting, setNextMeeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const now = new Date();
  const localISODate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      setLoading(false);
      return;
    }

    const todaySessionsFiltered = sessions.filter(
      (s) => s.scheduled_at?.split("T")[0] === localISODate
    );

    setTodaySessions(todaySessionsFiltered);
    setTodayCount(todaySessionsFiltered.length);

    const nextSession = sessions.find(
      (s) => s.scheduled_at?.split("T")[0] > localISODate
    );

    setNextMeeting(nextSession?.scheduled_at || null);
    setLoading(false);
  }, [sessions]);

  /* ------------------------- UPDATED ANALYTICS ------------------------- */
  const analytics = useMemo(() => {
    const totalSessions = sessions.length;
    const totalDocuments = documents.length;
    const totalArchived = documents.filter(
      (d) => d.status === "archived"
    ).length;
    const totalApproved = documents.filter(
      (d) => d.status === "approved"
    ).length;

    const memorandum = documents.filter((d) => d.type === "memorandum").length;
    const ordinance = documents.filter((d) => d.type === "ordinance").length;
    const resolution = documents.filter((d) => d.type === "resolution").length;

    return {
      totalSessions,
      totalDocuments,
      totalArchived,
      totalApproved,
      memorandum,
      ordinance,
      resolution,
    };
  }, [sessions, documents]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F6B3E" />
      </View>
    );
  }

  const renderAvatar = () => {
    if (logonUser?.avatar_url) {
      return (
        <Image
          source={{ uri: logonUser.avatar_url }}
          style={styles.profilePic}
        />
      );
    } else {
      const initials = `${logonUser?.firstname?.[0] || ""}${
        logonUser?.lastname?.[0] || ""
      }`.toUpperCase();
      return (
        <View style={styles.placeholderAvatar}>
          <Text style={styles.placeholderText}>{initials}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.userName}>
              {logonUser?.role === "mayor"
                ? `Mayor ${logonUser.firstname} ${logonUser.lastname}`
                : logonUser?.role === "secretary"
                ? `Secretary ${logonUser.firstname} ${logonUser.lastname}`
                : logonUser?.role === "vice_mayor"
                ? `Vice Mayor ${logonUser.firstname} ${logonUser.lastname}`
                : `Councilor ${logonUser?.firstname} ${logonUser?.lastname}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/protected/profile")}>
            {renderAvatar()}
          </TouchableOpacity>
        </View>

        {/* --- UPDATED OVERVIEW --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Total Sessions</Text>
              <Text style={styles.overviewValue}>
                {analytics.totalSessions}
              </Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Documents</Text>
              <Text style={styles.overviewValue}>
                {analytics.totalDocuments}
              </Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Archived</Text>
              <Text style={styles.overviewValue}>
                {analytics.totalArchived}
              </Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Approved</Text>
              <Text style={styles.overviewValue}>
                {analytics.totalApproved}
              </Text>
            </View>
          </View>
        </View>

        {/* --- UPDATED ANALYTICS --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.analyticsRow}>
            {[
              {
                label: "Memorandum",
                count: analytics.memorandum,
                color: "#0F6B3E",
              },
              {
                label: "Ordinance",
                count: analytics.ordinance,
                color: "#0077cc",
              },
              {
                label: "Resolution",
                count: analytics.resolution,
                color: "#cc3300",
              },
            ].map((item, index) => (
              <View key={index} style={styles.analyticsBarContainer}>
                <Text style={styles.analyticsLabel}>{item.label}</Text>
                <View style={styles.analyticsBarBg}>
                  <View
                    style={[
                      styles.analyticsBarFill,
                      {
                        width: `${
                          (item.count / Math.max(analytics.totalDocuments, 1)) *
                          100
                        }%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.analyticsCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Keep your existing cards, calendar, and modal unchanged */}
        {/* Today's Session & Next Meeting */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today's Session</Text>
          <Text style={styles.cardNumber}>{todayCount}</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="event-note" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Next Meeting</Text>
          <Text style={styles.cardNumber}>
            {nextMeeting
              ? new Date(nextMeeting).toLocaleDateString()
              : "No upcoming meetings"}
          </Text>
        </View>

        {/* Calendar (unchanged) */}
        <View style={styles.calendarWrapper}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: "#fff",
              calendarBackground: "#fff",
              textSectionTitleColor: "#0F6B3E",
              todayTextColor: "#0F6B3E",
              arrowColor: "#0F6B3E",
              monthTextColor: "#0F6B3E",
              textMonthFontWeight: "bold",
              textDayFontWeight: "500",
              textDayFontSize: 14,
            }}
            dayComponent={({ date, state }) => {
              if (!date) return null;
              const hasSession = sessions.some(
                (s) => s.scheduled_at?.split("T")[0] === date.dateString
              );
              const isToday = date.dateString === localISODate;
              const isPast = new Date(date.dateString) < new Date(localISODate);
              const isFuture =
                new Date(date.dateString) > new Date(localISODate);

              let label = "";
              let bgColor = "";

              if (hasSession) {
                if (isToday) {
                  label = "Today";
                  bgColor = "#0F6B3E";
                } else if (isPast) {
                  label = "Done";
                  bgColor = "#999";
                } else if (isFuture) {
                  label = "Soon";
                  bgColor = "#0077cc";
                }
              }

              return (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: isToday ? "#0F6B3E15" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: state === "disabled" ? "#ccc" : "#222",
                      fontWeight: isToday ? "bold" : "500",
                      fontSize: 14,
                    }}
                  >
                    {date.day}
                  </Text>
                  {hasSession && (
                    <View
                      style={{
                        backgroundColor: bgColor,
                        paddingHorizontal: 5,
                        paddingVertical: 2,
                        borderRadius: 5,
                        marginTop: 3,
                        minWidth: 38,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: "600",
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      </ScrollView>

      {/* Modal unchanged */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {todaySessions.length === 0 ? (
              <Text style={styles.noSessionsText}>
                No sessions scheduled today.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {todaySessions.map((session, index) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <Text style={styles.sessionTitle}>
                      {index + 1}. {session.type.replace("_", " ")}
                    </Text>
                    <Text style={styles.sessionDetail}>
                      🏛️ Venue: {session.venue || "Not specified"}
                    </Text>
                    <Text style={styles.sessionDetail}>
                      🕒 Time:{" "}
                      {new Date(session.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={styles.sessionDetail}>
                      📝 Description: {session.description || "No description"}
                    </Text>
                    <Text style={styles.sessionStatus}>
                      Status: {session.status}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    marginBottom: 30,
    marginTop: 20,
  },
  helloText: { fontSize: 16, color: "#444", marginBottom: 2 },
  userName: { fontWeight: "700", fontSize: 22, color: "#0F6B3E" },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0F6B3E",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#fff", fontWeight: "bold" },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0F6B3E",
    marginBottom: 10,
  },

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
    backgroundColor: "#e6f4ea",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 12,
  },
  overviewLabel: { fontSize: 12, color: "#0F6B3E" },
  overviewValue: { fontSize: 18, fontWeight: "bold", color: "#0F6B3E" },

  analyticsRow: { marginTop: 8 },
  analyticsBarContainer: { marginBottom: 10 },
  analyticsLabel: { fontSize: 12, color: "#555" },
  analyticsBarBg: {
    backgroundColor: "#eee",
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  analyticsBarFill: {
    height: 8,
    borderRadius: 4,
  },
  analyticsCount: { fontSize: 11, color: "#333" },

  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f4ea",
    borderRadius: 12,
    padding: 16,
  },
  reportTitle: { fontWeight: "700", color: "#0F6B3E", fontSize: 14 },
  reportSubtitle: { fontSize: 12, color: "#555" },

  card: {
    backgroundColor: "#e6f4ea",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardLabel: { fontSize: 12, color: "#0F6B3E" },
  cardNumber: { fontSize: 18, fontWeight: "bold", color: "#0F6B3E" },
  cardButton: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#0F6B3E",
    padding: 8,
    borderRadius: 8,
  },

  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    marginBottom: 24,
  },
  calendar: { borderRadius: 12, elevation: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
  },
  noSessionsText: { textAlign: "center", color: "#999", fontSize: 14 },
  sessionItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sessionTitle: { fontWeight: "700", color: "#0F6B3E" },
  sessionDetail: { fontSize: 12, color: "#555" },
  sessionStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F6B3E",
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#0F6B3E",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
