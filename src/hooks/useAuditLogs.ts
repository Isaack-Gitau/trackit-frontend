import { useQuery } from "@tanstack/react-query";

import { getAdminAuditLogs } from "../api/audit";

import type { AdminAuditLogFilters } from "../types/audit";

export const auditQueryKeys = {
  all: ["audit"] as const,

  logs: (filters: AdminAuditLogFilters) =>
    ["audit", "logs", filters] as const,
};

export function useAuditLogs(
  filters: AdminAuditLogFilters = {},
  accessToken: string | null,
) {
  return useQuery({
    queryKey: auditQueryKeys.logs(filters),

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load audit logs.",
        );
      }

      return getAdminAuditLogs(
        filters,
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}
