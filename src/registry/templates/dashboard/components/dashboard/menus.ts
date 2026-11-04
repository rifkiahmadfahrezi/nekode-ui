import { LayoutDashboard } from "lucide-react";
import type { LucideProps } from "lucide-react";

export interface MenuItem {
  title: string;
  path: string;
  badge?: string;
}

export interface Menu {
  module: string;
  title: string;
  icon: React.ElementType<LucideProps>;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

export interface MenuCategory {
  category: string;
  items: Menu[];
}

export const dashboardNavCategories: MenuCategory[] = [
  {
    category: "Main",
    items: [
      {
        module: "dashboard",
        title: "Overview",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
    ],
  },
];
