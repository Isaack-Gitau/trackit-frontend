import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteProfilePicture,
  updateProfile,
  updateProfilePrivacy,
  uploadProfilePicture,
} from "../api/profiles";

import type {
  ProfilePrivacyUpdatePayload,
  ProfileUpdatePayload,
} from "../types/profile";

export function useUpdateProfile(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: ProfileUpdatePayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to update your profile.",
        );
      }

      return updateProfile(
        payload,
        accessToken,
        signal,
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(
        ["profile"],
        profile,
      );
    },
  });
}

export function useUploadProfilePicture(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      signal,
    }: {
      file: File;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to upload a profile picture.",
        );
      }

      return uploadProfilePicture(
        file,
        accessToken,
        signal,
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(
        ["profile"],
        profile,
      );
    },
  });
}

export function useDeleteProfilePicture(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signal,
    }: {
      signal?: AbortSignal;
    } = {}) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete a profile picture.",
        );
      }

      return deleteProfilePicture(
        accessToken,
        signal,
      );
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(
        ["profile"],
        profile,
      );
    },
  });
}

export function useUpdateProfilePrivacy(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: ProfilePrivacyUpdatePayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to update profile privacy.",
        );
      }

      return updateProfilePrivacy(
        payload,
        accessToken,
        signal,
      );
    },
    onSuccess: (privacy) => {
      queryClient.setQueryData(
        ["profile-privacy"],
        privacy,
      );

      void queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
}
