import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreateAgent?: () => void;
}

export function DashboardLayout({ children, onCreateAgent }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const logoSrc = theme === 'dark' ? '/lovable-uploads/85abbc87-fafc-4307-86a1-f85ed74b639e.png' : '/lovable-uploads/c8c73254-3940-4a5b-b990-cb30d21dc890.png';
  
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
              <img src={logoSrc} alt="dolly" className="h-8 lg:h-10 w-auto object-contain" />
              <h1 className="text-lg lg:text-xl font-semibold">dolly</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}