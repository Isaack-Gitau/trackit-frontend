export type AuditLogActor = {
  id: number;
  username: string;
};

export type AdminAuditLog = {
  id: number;
  action: string;
  category: string;
  success: boolean;
  details: string | null;
  resource_type: string | null;
  resource_id: number | null;
  user_id: number | null;
  subject_user_id: number | null;
  actor: AuditLogActor | null;
  created_at: string;
};

export type AdminAuditLogListResponse = {
  items: AdminAuditLog[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminAuditLogFilters = {
  action?: string;
  category?: string;
  success?: boolean;
  user_id?: number;
  user_ids?: number[];
  subject_user_id?: number;
  resource_type?: string;
  resource_id?: number;
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
};

export type AdminAuditLogPreviewResponse = {
  total: number;
  action: string | null;
  category: string | null;
  success: boolean | null;
  user_id: number | null;
  user_ids: number[] | null;
  subject_user_id: number | null;
  resource_type: string | null;
  resource_id: number | null;
  created_from: string | null;
  created_to: string | null;
};

export type AuditLogExportFormat = "csv" | "json";
