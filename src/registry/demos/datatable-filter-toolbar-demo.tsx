"use client";

import { CircleCheck, CircleDashed, CircleOff, UserPlus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableResetFilters,
  DataTableSearch,
  DataTableToolbar,
  useDataTableFilters,
} from "@/components/ui/datatable";

type Role = "admin" | "editor" | "viewer";
type Status = "active" | "invited" | "inactive";

interface Member {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  team: string;
}

const NAMES = [
  "Alya Putri",
  "Bima Pratama",
  "Citra Dewi",
  "Dimas Saputra",
  "Eka Lestari",
  "Fajar Nugroho",
  "Gita Wijaya",
  "Hadi Santoso",
  "Indah Kusuma",
  "Joko Hidayat",
  "Kartika Sari",
  "Lukman Hakim",
  "Made Wirawan",
  "Nadia Rahma",
  "Oscar Tanoto",
  "Putri Ayu",
  "Rian Gunawan",
  "Siti Aminah",
  "Tono Setiawan",
  "Umar Said",
  "Vina Melati",
  "Wahyu Ramadhan",
  "Yusuf Halim",
  "Zahra Fitri",
];
const ROLES: Role[] = ["admin", "editor", "viewer"];
const STATUSES: Status[] = ["active", "invited", "inactive"];
const TEAMS = ["Design", "Engineering", "Marketing", "Product", "Support"];

const members: Member[] = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  role: ROLES[(i * 7) % 3],
  status: STATUSES[(i * 5) % 7 < 4 ? 0 : (i * 5) % 7 < 6 ? 1 : 2],
  team: TEAMS[(i * 3) % TEAMS.length],
}));

const roleOptions = ROLES.map((r) => ({
  value: r,
  label: r[0].toUpperCase() + r.slice(1),
}));
const statusOptions = [
  { value: "active", label: "Active", icon: <CircleCheck /> },
  { value: "invited", label: "Invited", icon: <CircleDashed /> },
  { value: "inactive", label: "Inactive", icon: <CircleOff /> },
];
const teamOptions = TEAMS.map((t) => ({ value: t, label: t }));

const columns: DataTableColumn<Member>[] = [
  { accessor: "name", title: "Name" },
  { accessor: "email", title: "Email" },
  { accessor: "team", title: "Team" },
  {
    accessor: "role",
    title: "Role",
    render: (m) => <span className="capitalize">{m.role}</span>,
  },
  {
    accessor: "status",
    title: "Status",
    render: (m) => <span className="capitalize">{m.status}</span>,
  },
];

const PAGE_SIZE = 8;

export function DataTableFilterToolbarDemo() {
  const filters = useDataTableFilters(members, {
    search: ["name", "email"],
    facets: { role: "role", status: "status", team: "team" },
  });
  const [page, setPage] = React.useState(1);

  const { filteredData } = filters;
  // Any filter change jumps back to page 1.
  const onFacet = (facet: "role" | "status" | "team") => (v: string[]) => {
    filters.setFacetValue(facet, v);
    setPage(1);
  };

  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full max-w-4xl">
      <DataTable
        data={pageData}
        columns={columns}
        idAccessor="id"
        noRecordsText="No members match these filters"
      >
        <DataTableToolbar
          actions={
            <Button size="sm" className="h-8">
              <UserPlus aria-hidden="true" />
              Invite
            </Button>
          }
        >
          <DataTableSearch
            value={filters.search}
            onValueChange={(v) => {
              filters.setSearch(v);
              setPage(1);
            }}
            placeholder="Search name or email…"
          />
          <DataTableFacetedFilter
            title="Role"
            options={roleOptions}
            value={filters.getFacetValue("role")}
            onValueChange={onFacet("role")}
            counts={filters.getFacetCounts("role")}
          />
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            value={filters.getFacetValue("status")}
            onValueChange={onFacet("status")}
            counts={filters.getFacetCounts("status")}
          />
          <DataTableFacetedFilter
            title="Team"
            options={teamOptions}
            value={filters.getFacetValue("team")}
            onValueChange={onFacet("team")}
            counts={filters.getFacetCounts("team")}
            searchable
          />
          <DataTableResetFilters
            visible={filters.isFiltered}
            onReset={() => {
              filters.reset();
              setPage(1);
            }}
          />
        </DataTableToolbar>
        <DataTablePagination
          page={page}
          totalRecords={filteredData.length}
          recordsPerPage={PAGE_SIZE}
          onPageChange={setPage}
        />
      </DataTable>
    </div>
  );
}
