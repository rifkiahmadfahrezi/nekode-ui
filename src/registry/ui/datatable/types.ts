import type * as React from "react";

export type SortDirection = "asc" | "desc";

export interface SortStatus<T> {
  columnAccessor: Extract<keyof T, string> | (string & {});
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  accessor: Extract<keyof T, string> | (string & {});
  id?: string;
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  sortable?: boolean;
  width?: number | string;
  render?: (record: T, rowIndex: number) => React.ReactNode;
  textAlign?: "left" | "center" | "right";
  pinned?: "left" | "right";
  footer?: React.ReactNode | ((data: T[]) => React.ReactNode);
}

export interface RowContextMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DataTablePaginationProps {
  page: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  recordsPerPageOptions?: number[];
  onRecordsPerPageChange?: (recordsPerPage: number) => void;
  renderInfo?: (info: {
    from: number;
    to: number;
    totalRecords: number;
    page: number;
    totalPages: number;
  }) => React.ReactNode;
  siblingCount?: number;
}

export interface BaseDataTableProps<T> {
  data: T[];
  fetching?: boolean;
  columns: DataTableColumn<T>[];
  idAccessor?: keyof T | ((record: T) => React.Key);
  selectedRecords?: T[];
  onSelectedRecordsChange?: (records: T[]) => void;
  height?: number;
  rowContextMenu?: (record: T, rowIndex: number) => RowContextMenuItem[] | undefined;
  pagination?: DataTablePaginationProps;
  noRecordsText?: string;
  highlightOnHover?: boolean;
  onRowClick?: (record: T, rowIndex: number) => void;
  className?: string;
  variant?: "bordered" | "borderless";
  rowClassName?: string | ((record: T, rowIndex: number) => string | undefined);
  rowStyle?: React.CSSProperties | ((record: T, rowIndex: number) => React.CSSProperties | undefined);
  headerClassName?: string;
  headerStyle?: React.CSSProperties;

  renderRowSubContent?: (record: T, rowIndex: number) => React.ReactNode;
  rowExpandable?: (record: T, rowIndex: number) => boolean;
  expandOnRowClick?: boolean;
  singleExpand?: boolean;
  expandedRecordIds?: React.Key[];
  onExpandedRecordIdsChange?: (ids: React.Key[]) => void;

  headerRef?: React.Ref<HTMLTableSectionElement>;
  bodyRef?: React.Ref<HTMLTableSectionElement>;
  footerRef?: React.Ref<HTMLDivElement>;
  tableRef?: React.Ref<HTMLTableElement>;
  scrollViewportRef?: React.Ref<HTMLDivElement>;
  rowRef?: (element: HTMLTableRowElement | null, record: T, rowIndex: number) => void;
}

export type SortProps<T> = {
  sortStatus?: SortStatus<T>;
  onSortStatusChange?: (status: SortStatus<T>) => void;
};
export type RequiredSortProps<T> = {
  sortStatus: SortStatus<T>;
  onSortStatusChange: (status: SortStatus<T>) => void;
};
