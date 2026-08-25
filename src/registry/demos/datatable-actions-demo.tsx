"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableAction,
  type DataTableColumn,
  type RowContextMenuItem,
} from "@/components/ui/datatable";

type Project = { id: number; name: string; owner: string; status: string };

const projects: Project[] = [
  { id: 1, name: "Website refresh", owner: "Alya", status: "In progress" },
  { id: 2, name: "Mobile onboarding", owner: "Bima", status: "Review" },
  { id: 3, name: "Brand guidelines", owner: "Citra", status: "Done" },
];

function actions(project: Project): RowContextMenuItem[] {
  return [
    {
      key: "view",
      label: "View project",
      icon: <Eye className="size-4" />,
      onClick: () => window.alert(`Viewing ${project.name}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="size-4" />,
      onClick: () => window.alert(`Editing ${project.name}`),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="size-4" />,
      danger: true,
      onClick: () => window.alert(`Deleting ${project.name}`),
    },
  ];
}

const columns: DataTableColumn<Project>[] = [
  { accessor: "name", title: "Project" },
  { accessor: "owner", title: "Owner" },
  { accessor: "status", title: "Status" },
  {
    accessor: "actions",
    title: "",
    width: 56,
    render: (project) => <DataTableAction items={actions(project)} />,
  },
];

export function DataTableActionsDemo() {
  return (
    <DataTable
      className="w-full max-w-xl"
      data={projects}
      columns={columns}
      idAccessor="id"
      rowContextMenu={actions}
    />
  );
}
