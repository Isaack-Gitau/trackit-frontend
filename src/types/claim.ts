export type ClaimStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export type ClaimItemSummary = {
  id: number;
  title: string;
  type: "lost" | "found";
  category: string;
  location: string;
  image: string | null;
};

export type Claim = {
  id: number;
  item_id: number;
  claimant_id: number;
  item: ClaimItemSummary;
  reason: string;
  status: ClaimStatus;
  rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClaimCreatePayload = {
  reason: string;
};
