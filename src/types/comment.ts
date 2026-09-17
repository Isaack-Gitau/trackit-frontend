export type CommentAuthor = {
  id: number;
  username: string;
  profile_picture: string | null;
};

export type ItemComment = {
  id: number;
  item_id: number;
  user_id: number;
  author: CommentAuthor;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CommentCreatePayload = {
  content: string;
};

export type CommentUpdatePayload = {
  content: string;
};
