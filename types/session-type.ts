export type SessionType = "regular" | "special";

export type SessionStatus = "draft" | "scheduled" | "ongoing" | "completed";

export interface Session {
  id: string;
  scheduled_at: string;
  type: SessionType;
  status: SessionStatus;
  venue?: string;
  description?: string;

  created_by: string;
  created_at: string;
}

export type SessionCreate = Omit<Session, "id" | "created_at">;

export type SessionUpdate = Partial<SessionCreate>;

export interface Agenda {
  id: string;
  session_id: string;
  document_id: string;

  created_at: string;
}

export type AgendaCreate = Omit<Agenda, "id" | "created_at">;

export type AgendaUpdate = Partial<AgendaCreate>;
