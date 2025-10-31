import { supabase } from "@/lib/supabase";
import { Agenda, Session } from "@/types/session-type";
import { create } from "zustand";

interface SessionState {
  sessions: (Session & {
    agendas?: (Agenda & { title?: string; file_url?: string })[];
  })[];
  agendas: (Agenda & { title?: string; file_url?: string })[];
  loading: boolean;
  error: string | null;

  fetchAllSessions: () => Promise<void>;
  subscribeToSessions: () => () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  agendas: [],
  loading: false,
  error: null,

  /* --------------------------- FETCH SESSIONS --------------------------- */
  fetchAllSessions: async () => {
    set({ loading: true });
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      const { data: sessionDocs, error: sessionDocsError } = await supabase
        .from("session_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (sessionDocsError) throw sessionDocsError;

      const { data: documents, error: docsError } = await supabase
        .from("documents")
        .select("id, title, file_url");

      if (docsError) throw docsError;

      const agendasWithDocs =
        sessionDocs?.map((agenda) => {
          const doc = documents?.find((d) => d.id === agenda.document_id);
          return {
            ...agenda,
            title: doc?.title,
            file_url: doc?.file_url ?? undefined,
          };
        }) ?? [];

      const sessionsWithAgendas =
        sessionsData?.map((session) => ({
          ...session,
          agendas: agendasWithDocs.filter((a) => a.session_id === session.id),
        })) ?? [];

      set({
        sessions: sessionsWithAgendas,
        agendas: agendasWithDocs,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  /* ------------------------ REALTIME SUBSCRIBE -------------------------- */
  subscribeToSessions: () => {
    const { fetchAllSessions } = get();

    const sessionChannel = supabase
      .channel("sessions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchAllSessions()
      )
      .subscribe();

    const sessionDocsChannel = supabase
      .channel("session-documents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_documents" },
        () => fetchAllSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(sessionDocsChannel);
    };
  },
}));
