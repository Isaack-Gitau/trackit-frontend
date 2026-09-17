import { apiRequest } from "./client";

import type {
  Profile,
  ProfilePrivacy,
  ProfilePrivacyUpdatePayload,
  ProfileUpdatePayload,
  PublicProfile,
} from "../types/profile";

export async function getProfile(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Profile> {
  return apiRequest<Profile>({
    method: "GET",
    path: "/api/profile",
    accessToken,
    signal,
  });
}

export async function updateProfile(
  payload: ProfileUpdatePayload,
  accessToken: string,
  signal?: AbortSignal,
): Promise<Profile> {
  return apiRequest<Profile>({
    method: "PATCH",
    path: "/api/profile",
    body: payload,
    accessToken,
    signal,
  });
}

export async function uploadProfilePicture(
  file: File,
  accessToken: string,
  signal?: AbortSignal,
): Promise<Profile> {
  const formData = new FormData();

  formData.append("image", file);

  return apiRequest<Profile>({
    method: "POST",
    path: "/api/profile/picture",
    body: formData,
    accessToken,
    signal,
  });
}

export async function deleteProfilePicture(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Profile> {
  return apiRequest<Profile>({
    method: "DELETE",
    path: "/api/profile/picture",
    accessToken,
    signal,
  });
}

export async function updateProfilePrivacy(
  payload: ProfilePrivacyUpdatePayload,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProfilePrivacy> {
  return apiRequest<ProfilePrivacy>({
    method: "PATCH",
    path: "/api/profile/privacy",
    body: payload,
    accessToken,
    signal,
  });
}

export async function getPublicProfile(
  userId: number,
  accessToken: string,
  signal?: AbortSignal,
): Promise<PublicProfile> {
  return apiRequest<PublicProfile>({
    method: "GET",
    path: `/api/profile/users/${userId}`,
    accessToken,
    signal,
  });
}
