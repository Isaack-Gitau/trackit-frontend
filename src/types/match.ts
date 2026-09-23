export type MatchLevel =
  | "none"
  | "possible"
  | "strong";

export type Match = {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  score: number;
  match_level: MatchLevel;
  category_score: number;
  title_score: number;
  description_score: number;
  location_score: number;
  time_score: number;
  reason: string;
  is_dismissed: boolean;
  created_at: string;
  updated_at: string;
};
