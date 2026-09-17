export type ProfileSocialLinks = Record<
  string,
  unknown
>;

export type ProfilePreferences = Record<
  string,
  unknown
>;

export type ProfilePrivacy = {
  profile_picture: boolean;
  bio: boolean;
  first_name: boolean;
  last_name: boolean;
  email: boolean;
  phone_number: boolean;
  social_links: boolean;
};

export type Profile = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  phone_number: string | null;
  bio: string | null;
  address: string | null;
  social_links: ProfileSocialLinks;
  preferences: ProfilePreferences;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdatePayload = {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  phone_number?: string | null;
  bio?: string | null;
  address?: string | null;
  social_links?: ProfileSocialLinks;
  preferences?: ProfilePreferences;
};

export type ProfilePrivacyUpdatePayload = {
  profile_picture?: boolean;
  bio?: boolean;
  first_name?: boolean;
  last_name?: boolean;
  email?: boolean;
  phone_number?: boolean;
  social_links?: boolean;
};

export type PublicProfileSocialLinks = Record<
  string,
  unknown
>;

export type PublicProfile = {
  id: number;
  username: string;
  profile_picture: string | null;
  bio: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  social_links: PublicProfileSocialLinks;
};
