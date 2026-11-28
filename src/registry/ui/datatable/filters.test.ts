import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { filterRecords, getFacetCounts, useDataTableFilters } from "./filters";

interface User {
  id: number;
  name: string;
  role: "admin" | "editor" | "viewer";
  tags: string[];
}

const users: User[] = [
  { id: 1, name: "Ada", role: "admin", tags: ["core"] },
  { id: 2, name: "Grace", role: "editor", tags: ["core", "docs"] },
  { id: 3, name: "Alan", role: "viewer", tags: [] },
  { id: 4, name: "Adele", role: "editor", tags: ["docs"] },
];

const options = {
  search: ["name"] as const satisfies (keyof User)[],
  facets: { role: "role", tags: (u: User) => u.tags },
} as const;

describe("filterRecords", () => {
  it("returns the same array when nothing is filtered", () => {
    expect(
      filterRecords(
        users,
        { search: " ", facetValues: {} },
        {
          search: [...options.search],
          facets: options.facets,
        },
      ),
    ).toBe(users);
  });

  it("ANDs search with facets and ORs values inside one facet", () => {
    const result = filterRecords(
      users,
      { search: "ad", facetValues: { role: ["admin", "editor"] } },
      { search: ["name"], facets: options.facets },
    );
    expect(result.map((u) => u.name)).toEqual(["Ada", "Adele"]);
  });

  it("matches array-valued facets on any item", () => {
    const result = filterRecords(
      users,
      { search: "", facetValues: { tags: ["docs"] } },
      { facets: options.facets },
    );
    expect(result.map((u) => u.id)).toEqual([2, 4]);
  });

  it("supports a custom search matcher", () => {
    const result = filterRecords(
      users,
      { search: "3", facetValues: {} },
      { search: (u, q) => String(u.id) === q },
    );
    expect(result).toEqual([users[2]]);
  });
});

describe("getFacetCounts", () => {
  it("ignores the facet's own selection but applies the others", () => {
    const counts = getFacetCounts<User, "role" | "tags">(
      users,
      "role",
      { search: "", facetValues: { role: ["admin"], tags: ["docs"] } },
      { facets: options.facets },
    );
    expect(Object.fromEntries(counts)).toEqual({ editor: 2 });
  });
});

describe("useDataTableFilters", () => {
  it("filters, reports isFiltered and resets", () => {
    const { result } = renderHook(() =>
      useDataTableFilters(users, {
        search: ["name"],
        facets: { role: "role" },
      }),
    );
    expect(result.current.isFiltered).toBe(false);
    act(() => result.current.setFacetValue("role", ["editor"]));
    expect(result.current.filteredData.map((u) => u.name)).toEqual([
      "Grace",
      "Adele",
    ]);
    act(() => result.current.setSearch("gr"));
    expect(result.current.filteredData.map((u) => u.name)).toEqual(["Grace"]);
    expect(result.current.isFiltered).toBe(true);
    expect(result.current.getFacetCounts("role").get("editor")).toBe(1);
    act(() => result.current.reset());
    expect(result.current.filteredData).toBe(users);
    expect(result.current.getFacetValue("role")).toEqual([]);
  });
});
