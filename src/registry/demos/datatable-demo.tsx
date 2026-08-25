"use client";

/**
 * Example usage of the modular <DataTable /> (in ./datatable) with dummy data.
 *
 * Demonstrates: sortable columns, shift-click range selection, declarative
 * column pinning, fixed height (sticky header/body/footer), right-click row
 * context menu, client-side pagination, custom row/header styling,
 * expandable nested rows, a column footer, and refs.
 *
 * Adjust the import path below to wherever you place the `datatable/` folder.
 */

import { Eye, Pencil, Trash2 } from "lucide-react";
import * as React from "react";
import {
  createSequenceColumn,
  DataTable,
  DataTableAction,
  type DataTableColumn,
  type SortStatus,
} from "@/components/ui/datatable";

/* ------------------------------------------------------------------------ */
/* Dummy data                                                                */
/* ------------------------------------------------------------------------ */

type Role = "admin" | "editor" | "viewer";
type Status = "active" | "invited" | "inactive";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinedAt: string;
  salary: number;
  bio: string;
  location: string;
}

const FIRST_NAMES = [
  "Andi",
  "Budi",
  "Citra",
  "Dewi",
  "Eka",
  "Fajar",
  "Gita",
  "Hadi",
  "Indah",
  "Joko",
  "Kartika",
  "Lestari",
  "Made",
  "Nadia",
  "Oscar",
  "Putri",
  "Rian",
  "Siti",
  "Tono",
  "Umar",
];
const LAST_NAMES = [
  "Saputra",
  "Wijaya",
  "Kusuma",
  "Pratama",
  "Wibowo",
  "Santoso",
  "Hidayat",
  "Setiawan",
  "Ramadhan",
  "Gunawan",
];
const ROLES: Role[] = ["admin", "editor", "viewer"];
const STATUSES: Status[] = ["active", "invited", "inactive"];
const CITIES = [
  "Bekasi",
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Semarang",
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const DUMMY_USERS: User[] = Array.from({ length: 87 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(seededRandom(i + 1) * LAST_NAMES.length)];
  const role = ROLES[Math.floor(seededRandom(i + 2) * ROLES.length)];
  const status = STATUSES[Math.floor(seededRandom(i + 3) * STATUSES.length)];
  const day = 1 + Math.floor(seededRandom(i + 4) * 27);
  const month = 1 + Math.floor(seededRandom(i + 5) * 12);
  const city = CITIES[Math.floor(seededRandom(i + 6) * CITIES.length)];
  return {
    id: `user-${i + 1}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
    role,
    status,
    joinedAt: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    salary: 5_000_000 + Math.floor(seededRandom(i + 7) * 20) * 500_000,
    bio: `${first} has been on the team since ${month}/2025 and mainly works on the ${role} side of things.`,
    location: city,
  };
});

/* ------------------------------------------------------------------------ */
/* Small presentational helpers                                             */
/* ------------------------------------------------------------------------ */

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    admin: "bg-purple-100 text-purple-700",
    editor: "bg-blue-100 text-blue-700",
    viewer: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    active: "bg-emerald-500",
    invited: "bg-amber-500",
    inactive: "bg-slate-300",
  };
  return (
    <span className="inline-flex items-center gap-2 capitalize">
      <span className={`h-2 w-2 rounded-full ${styles[status]}`} />
      {status}
    </span>
  );
}

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------------ */
/* Example page                                                             */
/* ------------------------------------------------------------------------ */

export function DataTableDemo() {
  const [fetching, setFetching] = React.useState(false);
  const [selected, setSelected] = React.useState<User[]>([]);
  const [page, setPage] = React.useState(1);
  const [recordsPerPage, setRecordsPerPage] = React.useState(10);
  const [sortStatus, setSortStatus] = React.useState<SortStatus<User>>({
    columnAccessor: "name",
    direction: "asc",
  });

  // Refs — all forwarded straight into <DataTable />.
  const headerRef = React.useRef<HTMLTableSectionElement>(null);
  const bodyRef = React.useRef<HTMLTableSectionElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setFetching(true);
    const timeout = setTimeout(() => setFetching(false), 500);
    return () => clearTimeout(timeout);
  }, [page, recordsPerPage, sortStatus]);

  const sorted = React.useMemo(() => {
    const copy = [...DUMMY_USERS];
    copy.sort((a, b) => {
      const key = sortStatus.columnAccessor as keyof User;
      const av = a[key];
      const bv = b[key];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortStatus.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [sortStatus]);

  const pageData = React.useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return sorted.slice(start, start + recordsPerPage);
  }, [sorted, page, recordsPerPage]);

  // Shared between the actions-column kebab menu and the right-click
  // context menu, so both stay in sync automatically.
  const getRowActions = React.useCallback(
    (record: User) => [
      {
        key: "view",
        label: "View profile",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => alert(`View ${record.name}`),
      },
      {
        key: "edit",
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: () => alert(`Edit ${record.name}`),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onClick: () => alert(`Delete ${record.name}`),
      },
    ],
    [],
  );

  const columns: DataTableColumn<User>[] = [
    // Numbers rows 1, 2, 3... continuing correctly across pages.
    createSequenceColumn<User>({ page, recordsPerPage }),
    {
      accessor: "name",
      title: "Name",
      sortable: true,
      width: 200,
      pinned: "left",
    },
    {
      accessor: "email",
      title: "Email",
      sortable: true,
      width: 260,
    },
    {
      accessor: "role",
      title: "Role",
      width: 120,
      render: (record) => <RoleBadge role={record.role} />,
    },
    {
      accessor: "status",
      title: "Status",
      width: 130,
      render: (record) => <StatusDot status={record.status} />,
    },
    {
      accessor: "salary",
      title: "Salary",
      sortable: true,
      width: 150,
      textAlign: "right",
      render: (record) => currency.format(record.salary),
      // Sums the salary column across the *current page* — swap for a
      // server-computed total if paginating server-side.
      footer: (pageRecords) =>
        currency.format(pageRecords.reduce((sum, r) => sum + r.salary, 0)),
    },
    {
      accessor: "joinedAt",
      title: "Joined",
      sortable: true,
      width: 130,
      textAlign: "right",
      render: (record) =>
        new Date(record.joinedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      accessor: "actions",
      title: "",
      width: 60,
      pinned: "right",
      // 3-dot button -> dropdown menu, reusing the same item list as the
      // row's right-click context menu below.
      render: (record) => <DataTableAction items={getRowActions(record)} />,
    },
  ];

  return (
    // <div className="space-y-4 p-6">
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <h2 className="text-lg font-semibold">Team members</h2>
    //       <p className="text-sm text-muted-foreground">
    //         {selected.length > 0
    //           ? `${selected.length} selected \u2014 try shift-click on a checkbox for a range`
    //           : `${DUMMY_USERS.length} total`}
    //       </p>
    //     </div>
    //   </div>

    // </div>
    <DataTable<User>
      data={pageData}
      fetching={fetching}
      idAccessor="id"
      height={420}
      columns={columns}
      sortStatus={sortStatus}
      onSortStatusChange={(status) => {
        setSortStatus(status);
        setPage(1);
      }}
      selectedRecords={selected}
      onSelectedRecordsChange={setSelected}
      headerClassName="bg-muted/40"
      rowClassName={(record) =>
        record.status === "inactive" ? "opacity-50" : undefined
      }
      renderRowSubContent={(record) => (
        <div className="space-y-1">
          <p className="text-sm">{record.bio}</p>
          <p className="text-xs text-muted-foreground">
            Based in {record.location}
          </p>
        </div>
      )}
      rowContextMenu={(record) => getRowActions(record)}
      headerRef={headerRef}
      bodyRef={bodyRef}
      footerRef={footerRef}
      tableRef={tableRef}
      scrollViewportRef={scrollViewportRef}
      pagination={{
        page,
        totalRecords: DUMMY_USERS.length,
        recordsPerPage,
        onPageChange: setPage,
        recordsPerPageOptions: [10, 25, 50],
        onRecordsPerPageChange: (n) => {
          setRecordsPerPage(n);
          setPage(1);
        },
        renderInfo: ({ from, to, totalRecords }) =>
          `rank ${from} to ${to} of ${totalRecords}`,
      }}
    />
  );
}
