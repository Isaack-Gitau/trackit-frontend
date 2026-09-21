export type Notification = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationUnreadCountResponse = {
  unread_count: number;
};

export type NotificationReadResponse = {
  id: number;
  user_id: number;
  is_read: boolean;
  read_at: string | null;
};

export type NotificationDeleteSelectedPayload = {
  notification_ids: number[];
};

export type NotificationDeleteResponse = {
  deleted_count: number;
};

export type NotificationMarkAllReadResponse = {
  updated_count: number;
};
