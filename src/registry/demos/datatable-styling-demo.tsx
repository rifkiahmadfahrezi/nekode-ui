"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/datatable";

type Task = {
  id: number;
  title: string;
  due: string;
  status: "Overdue" | "In progress" | "Done";
};

const tasks: Task[] = [
  { id: 1, title: "Send design handoff", due: "Yesterday", status: "Overdue" },
  { id: 2, title: "Review pull request", due: "Today", status: "In progress" },
  { id: 3, title: "Publish changelog", due: "Friday", status: "Done" },
];

const columns: DataTableColumn<Task>[] = [
  { accessor: "title", title: "Task" },
  { accessor: "due", title: "Due" },
  { accessor: "status", title: "Status" },
];

export function DataTableStylingDemo() {
  return (
    <DataTable
      className="w-full max-w-xl"
      data={tasks}
      columns={columns}
      idAccessor="id"
      variant="borderless"
      headerClassName="bg-muted/70"
      rowClassName={(task) =>
        task.status === "Overdue"
          ? "bg-destructive/10 text-destructive"
          : task.status === "Done"
            ? "opacity-55"
            : undefined
      }
      rowStyle={(task) =>
        task.status === "In progress"
          ? { borderLeft: "3px solid var(--primary)" }
          : undefined
      }
    />
  );
}
