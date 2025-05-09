// dashboard/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import MobileHeader from "@/components/mobile-header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
      <div className="flex min-h-screen">
        {/* Sidebar component */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1">
          {/* Mobile Header component */}
          <MobileHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
  );
}
