import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateAgent?: () => void;
}

export function DashboardLayout({ children, onCreateAgent }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Always visible on lg+ */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile Hamburger - Only visible on mobile/tablet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="search"
                placeholder="Search..."
                className="h-10 w-full rounded-2xl border-none bg-input px-4 text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          {/* Create Agent Button */}
          <Button 
            onClick={() => onCreateAgent ? onCreateAgent() : window.dispatchEvent(new CustomEvent('openCreateAgentModal'))} 
            size="sm" 
            className="ml-2 px-4"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Agent
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}