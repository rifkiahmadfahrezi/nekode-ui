"use client";

import * as React from "react";

/** Reads the value a facet filters on. Arrays match if any item is selected. */
export type FacetAccessor<T> =
  | Extract<keyof T, string>
  | ((record: T) => unknown);

export interface DataTableFilterOptions<T, F extends string = string> {
  /**
   * Fields the search box looks through, or a custom matcher. Matching is a
   * case-insensitive "contains" on the string form of each field.
   */
  search?: Extract<keyof T, string>[] | ((record: T, query: string) => boolean);
  /** Faceted filters, keyed by a name you pick (often the column accessor). */
  facets?: Record<F, FacetAccessor<T>>;
  /** Starting values, e.g. read from the URL. */
  initialSearch?: string;
  initialFacetValues?: Partial<Record<F, string[]>>;
}

export interface DataTableFilterState<F extends string = string> {
  search: string;
  facetValues: Partial<Record<F, string[]>>;
}

/** Normalises any facet value to the strings the filter UI compares. */
function facetKeys(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(facetKeys);
  return [String(value)];
}

function readFacet<T>(record: T, accessor: FacetAccessor<T>): string[] {
  return facetKeys(
    typeof accessor === "function"
      ? accessor(record)
      : (record as Record<string, unknown>)[accessor],
  );
}

function matchesSearch<T>(
  record: T,
  query: string,
  search: DataTableFilterOptions<T>["search"],
): boolean {
  if (!query || !search) return true;
  if (typeof search === "function") return search(record, query);
  const needle = query.toLowerCase();
  return search.some((key) => {
    const value = (record as Record<string, unknown>)[key];
    return value != null && String(value).toLowerCase().includes(needle);
  });
}

function matchesFacets<T, F extends string>(
  record: T,
  facets: Record<F, FacetAccessor<T>> | undefined,
  facetValues: Partial<Record<F, string[]>>,
  skip?: F,
): boolean {
  if (!facets) return true;
  for (const name of Object.keys(facets) as F[]) {
    if (name === skip) continue;
    const selected = facetValues[name];
    if (!selected || selected.length === 0) continue;
    const values = readFacet(record, facets[name]);
    if (!values.some((v) => selected.includes(v))) return false;
  }
  return true;
}

/**
 * Pure client-side filter: search query AND every active facet. Within one
 * facet the selected values are OR-ed (role is admin OR editor).
 */
export function filterRecords<T, F extends string = string>(
  data: T[],
  state: DataTableFilterState<F>,
  options: Pick<DataTableFilterOptions<T, F>, "search" | "facets">,
): T[] {
  const query = state.search.trim();
  const hasFacet = Object.values<string[] | undefined>(state.facetValues).some(
    (v) => v && v.length > 0,
  );
  if (!query && !hasFacet) return data;
  return data.filter(
    (r) =>
      matchesSearch(r, query, options.search) &&
      matchesFacets(r, options.facets, state.facetValues),
  );
}

/**
 * Counts per value for one facet, over the rows that pass the search and
 * every *other* facet. So picking "admin" doesn't zero out "editor".
 */
export function getFacetCounts<T, F extends string = string>(
  data: T[],
  facet: F,
  state: DataTableFilterState<F>,
  options: Pick<DataTableFilterOptions<T, F>, "search" | "facets">,
): Map<string, number> {
  const counts = new Map<string, number>();
  const accessor = options.facets?.[facet];
  if (!accessor) return counts;
  const query = state.search.trim();
  for (const r of data) {
    if (!matchesSearch(r, query, options.search)) continue;
    if (!matchesFacets(r, options.facets, state.facetValues, facet)) continue;
    for (const v of new Set(readFacet(r, accessor))) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return counts;
}

export interface UseDataTableFiltersResult<T, F extends string = string> {
  /** `data` with the search and every facet applied. */
  filteredData: T[];
  search: string;
  setSearch: (search: string) => void;
  facetValues: Partial<Record<F, string[]>>;
  /** Selected values of one facet; always an array. */
  getFacetValue: (facet: F) => string[];
  setFacetValue: (facet: F, values: string[]) => void;
  /** Row counts per value of one facet, for `DataTableFacetedFilter`'s `counts`. */
  getFacetCounts: (facet: F) => Map<string, number>;
  /** True when the search or any facet is active. */
  isFiltered: boolean;
  /** Clears the search and every facet. */
  reset: () => void;
}

/**
 * Client-side search + faceted filtering for `DataTable`. Feed its state to
 * `DataTableSearch` / `DataTableFacetedFilter` and pass `filteredData` (or a
 * page of it) to the table. For server-side filtering, skip this hook and
 * send the same state to your API instead.
 */
export function useDataTableFilters<T, F extends string = string>(
  data: T[],
  options: DataTableFilterOptions<T, F> = {},
): UseDataTableFiltersResult<T, F> {
  const {
    search: searchOption,
    facets,
    initialSearch,
    initialFacetValues,
  } = options;
  const [search, setSearch] = React.useState(initialSearch ?? "");
  const [facetValues, setFacetValues] = React.useState<
    Partial<Record<F, string[]>>
  >(initialFacetValues ?? {});

  // Options are usually inline object literals; keep the latest without
  // making every memo below depend on their identity.
  const optionsRef = React.useRef({ search: searchOption, facets });
  optionsRef.current = { search: searchOption, facets };

  const state = React.useMemo(
    () => ({ search, facetValues }),
    [search, facetValues],
  );

  const filteredData = React.useMemo(
    () => filterRecords(data, state, optionsRef.current),
    [data, state],
  );

  const setFacetValue = React.useCallback((facet: F, values: string[]) => {
    setFacetValues((prev) => ({ ...prev, [facet]: values }));
  }, []);

  const getFacetValue = React.useCallback(
    (facet: F) => facetValues[facet] ?? [],
    [facetValues],
  );

  const countsFor = React.useCallback(
    (facet: F) => getFacetCounts(data, facet, state, optionsRef.current),
    [data, state],
  );

  const reset = React.useCallback(() => {
    setSearch("");
    setFacetValues({});
  }, []);

  const isFiltered =
    search.trim() !== "" ||
    Object.values<string[] | undefined>(facetValues).some(
      (v) => v && v.length > 0,
    );

  return {
    filteredData,
    search,
    setSearch,
    facetValues,
    getFacetValue,
    setFacetValue,
    getFacetCounts: countsFor,
    isFiltered,
    reset,
  };
}
