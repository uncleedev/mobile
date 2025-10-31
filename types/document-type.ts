export type DocumentType = "ordinance" | "resolution" | "memorandum";

export type DocumentStatus =
  | "draft"
  | "for_review"
  | "in_session"
  | "approved"
  | "rejected"
  | "archived"
  | "vetoed";

export interface Document {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  author_name: string;
  series: string;
  approved_by?: string | null;
  approved_at?: string | null;
  description?: string | null;
  file_path?: string | null;
  file_url?: string | null;
  file_name?: string | null;

  created_by: string;
  created_at: string;
}

export type DocumentCreate = Omit<Document, "id" | "created_at">;

export type DocumentUpdate = Partial<DocumentCreate>;
