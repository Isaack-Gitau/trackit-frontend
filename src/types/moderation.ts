export type ModerationUserDetail = {
  id: number;
  username: string;
  role: "user" | "moderator" | "admin";
  is_active: boolean;
  is_verified: boolean;
  deactivated_at: string | null;
  deactivated_until: string | null;
  deactivation_reason: string | null;
};
