import { supabase } from "@/lib/supabase";
import { Document, DocumentCreate } from "@/types/document-type";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system/legacy";
import * as mime from "react-native-mime-types";
import { create } from "zustand";

/* -------------------------------------------------------------------------- */
/*                               ZUSTAND STORE                                */
/* -------------------------------------------------------------------------- */

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;

  fetchAllDocuments: () => Promise<void>;
  uploadDocument: (fileUri: string, meta: DocumentCreate) => Promise<void>;
  updateDocument: (updatedDoc: Document) => Promise<void>;
  removeDocument: (id: string, file_path?: string) => Promise<void>;
  setDocuments: (docs: Document[]) => void;
  subscribeToDocuments: () => () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  /* --------------------------- FETCH DOCUMENTS --------------------------- */
  fetchAllDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ documents: data || [] });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch documents" });
    } finally {
      set({ loading: false });
    }
  },

  /* -------------------------- UPLOAD DOCUMENT --------------------------- */
  uploadDocument: async (fileUri, meta) => {
    set({ loading: true, error: null });
    try {
      const fileExt = fileUri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });

      const contentType = mime.lookup(fileUri) || "application/octet-stream";

      // Convert base64 → Uint8Array
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const fileBuffer = new Uint8Array(byteNumbers);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, fileBuffer, { contentType, upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Insert record
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            ...meta,
            file_name: fileName,
            file_path: filePath,
            file_url: publicData.publicUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const { documents } = get();
      set({ documents: [data, ...documents] });
    } catch (err: any) {
      set({ error: err.message || "Failed to upload document" });
    } finally {
      set({ loading: false });
    }
  },

  /* ----------------------------- UPDATE DOC ----------------------------- */
  updateDocument: async (updatedDoc) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from("documents")
        .update(updatedDoc)
        .eq("id", updatedDoc.id);
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* ----------------------------- DELETE DOC ----------------------------- */
  removeDocument: async (id, file_path) => {
    set({ loading: true });
    try {
      if (file_path) {
        await supabase.storage.from("documents").remove([file_path]);
      }
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;

      set({
        documents: get().documents.filter((doc) => doc.id !== id),
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* --------------------------- SET DOCUMENTS ---------------------------- */
  setDocuments: (docs) => set({ documents: docs }),

  /* ------------------------ REALTIME SUBSCRIBE -------------------------- */
  subscribeToDocuments: () => {
    const channel = supabase
      .channel("documents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents" },
        (payload) => {
          const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
          const newDoc = payload.new as Document | null;
          const oldDoc = payload.old as Document | null;
          const { documents } = get();

          if (eventType === "INSERT" && newDoc) {
            if (!documents.some((d) => d.id === newDoc.id)) {
              set({ documents: [newDoc, ...documents] });
            }
          }

          if (eventType === "UPDATE" && newDoc) {
            set({
              documents: documents.map((d) =>
                d.id === newDoc.id ? { ...d, ...newDoc } : d
              ),
            });
          }

          if (eventType === "DELETE" && oldDoc) {
            set({
              documents: documents.filter((d) => d.id !== oldDoc.id),
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));
