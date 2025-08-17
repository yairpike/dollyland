import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} className="w-full">
      <div className="min-h-screen flex w-full bg-urbanist-light">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 pr-6">
          {/* Header */}
          <header className="h-20 border-none bg-card/80 backdrop-blur-sm flex items-center justify-between px-8 rounded-b-3xl shadow-sm ml-4">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="h-10 w-10 rounded-2xl hover:bg-urbanist-lavender/50 lg:hidden" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="h-11 w-80 rounded-2xl border-none bg-urbanist-light px-4 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme toggle moved to settings */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-background min-w-0 ml-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}