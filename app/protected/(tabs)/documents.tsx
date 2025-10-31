import { useDocumentStore } from "@/stores/document-store";
import { useUserStore } from "@/stores/user-store";
import {
  Document,
  DocumentCreate,
  DocumentStatus,
  DocumentType,
  DocumentUpdate,
} from "@/types/document-type";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DocumentsScreen() {
  const { documents, uploadDocument, updateDocument, removeDocument } =
    useDocumentStore();
  const { logonUser } = useUserStore();

  const userId = logonUser?.id ?? "";
  const userRole = logonUser?.role ?? "";
  const authorName = logonUser
    ? `${logonUser.firstname} ${logonUser.lastname}`
    : "Unknown";

  const [searchText, setSearchText] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<DocumentStatus | "">("");
  const [filterType, setFilterType] = useState<DocumentType | "">("");

  const [formData, setFormData] = useState<
    Omit<DocumentCreate, "created_by" | "author_name"> & { file: any | null }
  >({
    title: "",
    description: "",
    type: "" as DocumentType,
    status: "" as DocumentStatus,
    series: "",
    file: null,
  });

  /* -------------------- FILTER + SEARCH -------------------- */
  useEffect(() => {
    let filtered = documents;

    if (searchText.trim()) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
          doc.author_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterType)
      filtered = filtered.filter((doc) => doc.type === filterType);
    if (filterStatus)
      filtered = filtered.filter((doc) => doc.status === filterStatus);

    setFilteredDocs(filtered);
  }, [searchText, filterStatus, filterType, documents]);

  /* -------------------- PICK FILE -------------------- */
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert("Error", "File must be less than 10 MB");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.type ||
      !formData.status ||
      !formData.series
    ) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setActionLoading(true);

    try {
      if (isEditMode && selectedDoc) {
        const updatePayload: DocumentUpdate = {
          title: formData.title,
          author_name: authorName,
          description: formData.description,
          type: formData.type,
          status: formData.status,
          series: formData.series,
        };

        await updateDocument({ ...selectedDoc, ...updatePayload });
        Alert.alert("Success", "Document updated successfully!");
      } else {
        if (!formData.file) {
          Alert.alert("Error", "Please upload a file.");
          setActionLoading(false);
          return;
        }

        const createPayload: DocumentCreate = {
          title: formData.title,
          author_name: authorName,
          description: formData.description,
          type: formData.type,
          status: formData.status,
          series: formData.series,
          created_by: userId,
        };

        await uploadDocument(formData.file.uri, createPayload);
        Alert.alert("Success", "Document added successfully!");
      }

      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* -------------------- DELETE -------------------- */
  const handleDelete = async (doc: Document) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${doc.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await removeDocument(doc.id, doc.file_path || undefined);
              Alert.alert("Deleted", "Document removed successfully");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "" as DocumentType,
      status: "" as DocumentStatus,
      series: "",
      file: null,
    });
    setSelectedDoc(null);
    setIsEditMode(false);
  };

  const openEditModal = (doc: Document) => {
    setFormData({
      title: doc.title,
      description: doc.description || "",
      type: doc.type,
      status: doc.status,
      series: doc.series,
      file: null,
    });
    setSelectedDoc(doc);
    setIsEditMode(true);
    setModalVisible(true);
  };

  /* -------------------- UI -------------------- */
  return (
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or author"
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 🧩 Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["", "ordinance", "resolution", "memorandum"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type as DocumentType | "")}
              style={[
                styles.filterChip,
                filterType === type && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === type && styles.filterChipTextActive,
                ]}
              >
                {type === "" ? "All Types" : type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 6 }}
        >
          {[
            "",
            "draft",
            "for_review",
            "in_session",
            "approved",
            "rejected",
            "archived",
          ].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status as DocumentStatus | "")}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.filterChipTextActive,
                ]}
              >
                {status === "" ? "All Status" : status.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ➕ Add Button (Councilor only) */}
      {userRole === "councilor" && (
        <TouchableOpacity
          style={[styles.addDocButton, actionLoading && { opacity: 0.6 }]}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          disabled={actionLoading}
        >
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={styles.addDocText}>Add New Document</Text>
        </TouchableOpacity>
      )}

      {/* 📄 Document List */}
      <FlatList
        data={filteredDocs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.docCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{item.title}</Text>
              <Text style={styles.docMeta}>
                {item.type} • {item.status.replace("_", " ")} • Series{" "}
                {item.series}
              </Text>
              <Text style={styles.docAuthor}>By {item.author_name}</Text>
            </View>

            <View style={styles.docActions}>
              <TouchableOpacity
                onPress={() =>
                  item.file_url
                    ? Linking.openURL(item.file_url)
                    : Alert.alert("No file available")
                }
              >
                <Feather name="file-text" size={18} color="#0F6B3E" />
              </TouchableOpacity>

              {userRole === "councilor" && item.created_by === userId && (
                <>
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={{ marginLeft: 10 }}
                    disabled={actionLoading}
                  >
                    <Feather name="edit-3" size={18} color="#007AFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{ marginLeft: 10 }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size={16} color="red" />
                    ) : (
                      <Feather name="trash-2" size={18} color="red" />
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noDocsText}>No documents found.</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* -------------------- ADD/EDIT MODAL -------------------- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Document" : "Add Document"}
              </Text>

              {/* TYPE */}
              <Text style={styles.inputLabel}>Type</Text>
              {["ordinance", "resolution", "memorandum"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioRow}
                  onPress={() =>
                    setFormData({ ...formData, type: type as DocumentType })
                  }
                >
                  <Feather
                    name={formData.type === type ? "check-circle" : "circle"}
                    size={18}
                    color={formData.type === type ? "#0F6B3E" : "#aaa"}
                  />
                  <Text style={styles.radioLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* STATUS */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Status</Text>
              {["draft", "for_review"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.radioRow}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      status: status as DocumentStatus,
                    })
                  }
                >
                  <Feather
                    name={
                      formData.status === status ? "check-circle" : "circle"
                    }
                    size={18}
                    color={formData.status === status ? "#0F6B3E" : "#aaa"}
                  />
                  <Text style={styles.radioLabel}>
                    {status === "draft" ? "Draft" : "For Review"}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* SERIES */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>
                Series (Year)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 20 }, (_, i) => 2006 + i)
                  .reverse()
                  .map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.radioYear}
                      onPress={() =>
                        setFormData({ ...formData, series: year.toString() })
                      }
                    >
                      <Text
                        style={[
                          styles.yearText,
                          {
                            color:
                              formData.series === year.toString()
                                ? "#fff"
                                : "#0F6B3E",
                            backgroundColor:
                              formData.series === year.toString()
                                ? "#0F6B3E"
                                : "#E8F5E9",
                          },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              {/* TITLE */}
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                style={styles.input}
              />

              {/* DESCRIPTION */}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                value={formData.description || ""}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                style={styles.input}
                multiline
              />

              {/* FILE */}
              {(formData.status === "draft" ||
                formData.status === "for_review") && (
                <>
                  <Text style={styles.inputLabel}>Upload PDF</Text>
                  <TouchableOpacity
                    style={styles.addDocButtonModal}
                    onPress={pickFile}
                    disabled={actionLoading}
                  >
                    <Text style={styles.addDocText}>
                      {formData.file ? formData.file.name : "Choose File"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* SUBMIT BUTTON */}
              <TouchableOpacity
                style={[
                  styles.addDocButtonModal,
                  actionLoading && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addDocText}>
                    {isEditMode ? "Update Document" : "Submit"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#333" },
  filterSection: { marginBottom: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#0F6B3E",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    backgroundColor: "#E8F5E9",
  },
  filterChipActive: { backgroundColor: "#0F6B3E" },
  filterChipText: {
    color: "#0F6B3E",
    fontSize: 12,
    textTransform: "capitalize",
  },
  filterChipTextActive: { color: "#fff" },
  addDocButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F6B3E",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  addDocText: { color: "#fff", fontWeight: "600", fontSize: 14, marginLeft: 6 },
  docCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  docTitle: { fontWeight: "700", fontSize: 14, color: "#222" },
  docMeta: { fontSize: 12, color: "#555", marginTop: 4 },
  docAuthor: { fontSize: 12, color: "#777", marginTop: 2 },
  docActions: { flexDirection: "row", alignItems: "center" },
  noDocsText: { textAlign: "center", color: "#666", marginTop: 20 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  radioLabel: { marginLeft: 8, fontSize: 14, color: "#333" },
  radioYear: { marginRight: 6 },
  yearText: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
  },
  addDocButtonModal: {
    backgroundColor: "#0F6B3E",
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  closeButtonText: { color: "#333", fontWeight: "600" },
});
