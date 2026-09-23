export type ItemType = "lost" | "found";

export type ItemStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "claimed";

export type Item = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  location: string;
  image: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
};

export type PublicItemFilters = {
  search?: string;
  type?: ItemType;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
};

export type CreateItemPayload = {
  title: string;
  description: string;
  type: ItemType;
  category: string;
  location: string;
  image?: File | null;
};

