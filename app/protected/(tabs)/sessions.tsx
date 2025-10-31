import { useDocumentStore } from "@/stores/document-store";
import { useSessionStore } from "@/stores/session-store";
import { Agenda } from "@/types/session-type";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SessionScreen() {
  const { sessions, agendas, loading, error } = useSessionStore();

  const { documents } = useDocumentStore();

  const [search, setSearch] = useState("");

  /* ------------------------------- FILTERED DATA ------------------------------ */
  const filteredSessions = useMemo(() => {
    if (!search) return sessions;

    return sessions.filter((session) => {
      const sessionMatch =
        session.type.toLowerCase().includes(search.toLowerCase()) ||
        session.venue?.toLowerCase().includes(search.toLowerCase());

      const agendasForSession = agendas.filter(
        (a) => a.session_id === session.id
      );
      const agendaMatch = agendasForSession.some((agenda) => {
        const doc = documents.find((d) => d.id === agenda.document_id);
        return doc?.title?.toLowerCase().includes(search.toLowerCase());
      });

      return sessionMatch || agendaMatch;
    });
  }, [sessions, agendas, documents, search]);

  /* ------------------------------ GET AGENDAS ------------------------------ */
  const getAgendasBySession = (
    sessionId: string
  ): (Agenda & { title?: string; file_url?: string })[] => {
    const relatedAgendas = agendas.filter((a) => a.session_id === sessionId);
    return relatedAgendas.map((agenda) => {
      const doc = documents.find((d) => d.id === agenda.document_id);
      return {
        ...agenda,
        title: doc?.title,
        file_url: doc?.file_url ?? undefined,
      };
    });
  };

  /* ------------------------------ LOADING & ERROR ----------------------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F6B3E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by type, venue, or agenda"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Session List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredSessions.length === 0 ? (
          <Text style={styles.noItemsText}>No sessions available.</Text>
        ) : (
          filteredSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle}>{session.type}</Text>
                <Text style={styles.sessionMeta}>Venue: {session.venue}</Text>
                <Text style={styles.sessionMeta}>
                  {new Date(session.scheduled_at).toLocaleString()}
                </Text>

                {/* Agendas */}
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.agendaHeader}>Agendas:</Text>
                  {getAgendasBySession(session.id).length === 0 ? (
                    <Text style={styles.agendaEmpty}>No agenda documents.</Text>
                  ) : (
                    getAgendasBySession(session.id).map((agenda) => (
                      <TouchableOpacity
                        key={agenda.id}
                        onPress={() => {
                          if (agenda.file_url) Linking.openURL(agenda.file_url);
                        }}
                        style={styles.agendaItem}
                      >
                        <Feather
                          name="file-text"
                          size={14}
                          color="#0F6B3E"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.agendaTitle}>
                          {agenda.title || "Untitled Document"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      session.status === "completed"
                        ? "#DFF2E1"
                        : session.status === "scheduled"
                        ? "#FFF3CD"
                        : "#E3F2FD",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        session.status === "completed"
                          ? "#0F6B3E"
                          : session.status === "scheduled"
                          ? "#856404"
                          : "#0D47A1",
                    },
                  ]}
                >
                  {session.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------- STYLES ------------------------------- */
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 40,
    backgroundColor: "#F8F8F8",
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: "#333" },
  sessionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  sessionTitle: { fontWeight: "bold", fontSize: 15, color: "#222" },
  sessionMeta: { fontSize: 12, color: "#555", marginTop: 2 },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "center",
    minWidth: 70,
    alignItems: "center",
  },
  statusText: { fontWeight: "bold", fontSize: 11 },
  noItemsText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontStyle: "italic",
  },
  agendaHeader: { fontWeight: "bold", fontSize: 13, color: "#0F6B3E" },
  agendaEmpty: { fontSize: 12, color: "#999", fontStyle: "italic" },
  agendaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  agendaTitle: {
    color: "#0F6B3E",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
