import { useQuery } from "@tanstack/react-query";

import { getPublicItems } from "../api/items";

import type { PublicItemFilters } from "../types/item";

export function usePublicItems(
  filters: PublicItemFilters = {},
) {
  return useQuery({
    queryKey: ["public-items", filters],
    queryFn: ({ signal }) =>
      getPublicItems(filters, { signal }),
  });
}
