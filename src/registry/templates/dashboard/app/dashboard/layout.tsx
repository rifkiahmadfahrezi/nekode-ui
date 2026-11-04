import { ThemeProvider } from "next-themes";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

// next-themes skips a nested provider, so this is safe even if the root
// layout already has one. Add suppressHydrationWarning to <html>.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <DashboardShell>{children}</DashboardShell>
      </TooltipProvider>
    </ThemeProvider>
  );
}
