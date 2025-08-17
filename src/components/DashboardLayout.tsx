import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <SidebarProvider defaultOpen={true} className="w-full">
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 pr-6">
          {/* Header */}
          <header className="h-20 border-none bg-card/80 backdrop-blur-sm flex items-center justify-between px-8 rounded-b-3xl shadow-sm ml-4">
            <div className="flex items-center gap-6">
              {/* Mobile hamburger menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden h-10 w-10 rounded-2xl hover:bg-accent flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <div onClick={() => setMobileMenuOpen(false)}>
                    <AppSidebar />
                  </div>
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="h-11 w-80 rounded-2xl border-none bg-input px-4 text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
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