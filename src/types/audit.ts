export type AuditLogActor = {
  id: number;
  username: string;
};

export type AdminAuditLog = {
  id: number;
  action: string;
  success: boolean;
  details: string | null;
  resource_type: string | null;
  resource_id: number | null;
  user_id: number | null;
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
  success?: boolean;
  user_id?: number;
  resource_type?: string;
  resource_id?: number;
  page?: number;
  limit?: number;
};
