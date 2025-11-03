import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  DSNavigation,
  DSNavItem,
  DSNavList,
  DSButton,
  DSDialog,
  DSDialogContent,
  DSDialogDescription,
  DSDialogHeader,
  DSDialogTitle,
  DSDialogTrigger,
} from "@/components/design-system";
import { Home, Settings, Bell } from "lucide-react";

interface NavigationProps {
  currentPage: "home" | "components" | "examples" | "installation";
}

export function Navigation({ currentPage }: NavigationProps) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <DSNavigation>
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Dollyland
          </h1>
          <DSNavList>
            <li>
              <DSNavItem 
                href="/" 
                icon={Home} 
                isActive={currentPage === "home"}
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
              >
                Home
              </DSNavItem>
            </li>
            <li>
              <DSNavItem 
                href="/design-system" 
                isActive={currentPage === "components"}
                onClick={(e) => { e.preventDefault(); navigate('/design-system'); }}
              >
                Components
              </DSNavItem>
            </li>
            <li>
              <DSNavItem 
                href="/installation" 
                isActive={currentPage === "installation"}
                onClick={(e) => { e.preventDefault(); navigate('/installation'); }}
              >
                Installation
              </DSNavItem>
            </li>
            <li>
              <DSNavItem 
                href="/examples" 
                isActive={currentPage === "examples"}
                onClick={(e) => { e.preventDefault(); navigate('/examples'); }}
              >
                Examples
              </DSNavItem>
            </li>
          </DSNavList>
        </div>
        <div className="flex items-center gap-4">
          <DSButton 
            variant="ghost" 
            size="icon"
            onClick={() => toast({ title: "Notifications", description: "No new notifications" })}
          >
            <Bell className="w-4 h-4" />
          </DSButton>
          <DSDialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DSDialogTrigger asChild>
              <DSButton variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </DSButton>
            </DSDialogTrigger>
            <DSDialogContent>
              <DSDialogHeader>
                <DSDialogTitle>Settings</DSDialogTitle>
                <DSDialogDescription>
                  Manage your application settings and preferences.
                </DSDialogDescription>
              </DSDialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">Settings panel coming soon...</p>
              </div>
            </DSDialogContent>
          </DSDialog>
        </div>
      </div>
    </DSNavigation>
  );
}
