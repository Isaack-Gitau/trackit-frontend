export type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "withdrawn";

export type ReporterModerationIdentity = {
  id: number;
  username: string;
};

export type Report = {
  id: number;
  item_id: number;
  reporter_id: number;
  reason: string;
  description: string;
  status: ReportStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ModerationReport = Report & {
  reporter: ReporterModerationIdentity;
};

export type CreateReportPayload = {
  reason: string;
  description: string;
};
