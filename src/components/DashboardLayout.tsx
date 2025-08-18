import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import dollyLogo from "/lovable-uploads/8dc3b4f9-4ebf-4b9b-90c7-c85727a0e166.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateAgent?: () => void;
}

export function DashboardLayout({ children, onCreateAgent }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Always visible on lg+ */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen z-10">
        <AppSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Header */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 lg:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - visible on all screen sizes */}
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
            
            {/* Logo and App Name */}
            <div className="flex items-center gap-3">
              <img src={dollyLogo} alt="dolly" className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg" />
              <h1 className="text-lg lg:text-xl font-semibold">dolly</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 lg:px-8 pb-4 lg:pb-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}