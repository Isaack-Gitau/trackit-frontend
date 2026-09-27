export type AdminUserRole =
  | "user"
  | "moderator"
  | "admin";

export type AdminAccountStatus =
  | "active"
  | "inactive";

export type AdminUserListItem = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminUserRole;
  is_active: boolean;
  is_verified: boolean;
  deactivated_at: string | null;
  deactivated_until: string | null;
  deactivation_reason: string | null;
  created_at: string;
};

export type AdminUserListResponse = {
  items: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminUserDetail = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminUserRole;
  is_active: boolean;
  is_verified: boolean;
  password_changed_at: string | null;
  deactivated_at: string | null;
  deactivated_until: string | null;
  deactivation_reason: string | null;
  profile_picture: string | null;
  phone_number: string | null;
  bio: string | null;
  address: string | null;
  social_links: Record<string, unknown>;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AdminUserFilters = {
  search?: string;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
  page?: number;
  limit?: number;
};

export type UserSuspensionPayload = {
  duration_hours: number;
  reason?: string | null;
};

export type AdminEmailPayload = {
  user_ids: number[];
  subject: string;
  message: string;
};

export type AdminEmailDeliveryResult = {
  user_id: number;
  success: boolean;
  error: string | null;
};

export type AdminEmailResponse = {
  total: number;
  sent: number;
  failed: number;
  results: AdminEmailDeliveryResult[];
};
