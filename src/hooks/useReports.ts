import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createReport,
  getMyReports,
  getReport,
  withdrawReport,
} from "../api/reports";

import type { CreateReportPayload } from "../types/report";

export const reportQueryKeys = {
  all: ["reports"] as const,

  list: ["reports", "list"] as const,

  detail: (reportId: number) =>
    ["reports", "detail", reportId] as const,
};

export function useMyReports(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: reportQueryKeys.list,

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your reports.",
        );
      }

      return getMyReports(
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

export function useReport(
  reportId: number | null,
  accessToken: string | null,
) {
  return useQuery({
    queryKey:
      reportId === null
        ? reportQueryKeys.detail(0)
        : reportQueryKeys.detail(reportId),

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load this report.",
        );
      }

      if (reportId === null) {
        throw new Error(
          "A valid report ID is required.",
        );
      }

      return getReport(
        reportId,
        accessToken,
        { signal },
      );
    },

    enabled:
      Boolean(accessToken) &&
      reportId !== null,
  });
}

export function useCreateReport(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: number;
      payload: CreateReportPayload;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to submit a report.",
        );
      }

      return createReport(
        itemId,
        payload,
        accessToken,
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: reportQueryKeys.list,
      });
    },
  });
}

export function useWithdrawReport(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to withdraw a report.",
        );
      }

      return withdrawReport(
        reportId,
        accessToken,
      );
    },

    onSuccess: (report) => {
      void queryClient.invalidateQueries({
        queryKey: reportQueryKeys.list,
      });

      void queryClient.invalidateQueries({
        queryKey: reportQueryKeys.detail(report.id),
      });
    },
  });
}
