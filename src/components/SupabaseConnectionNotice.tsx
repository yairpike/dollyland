import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export const SupabaseConnectionNotice = () => {
  if (isSupabaseConfigured()) {
    return null; // Don't show if Supabase is properly configured
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Supabase Not Connected</h2>
          <p className="text-muted-foreground mb-6">
            This AI agent platform requires a Supabase connection to function properly. Please connect your project to Supabase to continue.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Database className="w-4 h-4" />
              <span>Authentication & Database Required</span>
            </div>
            
            <Button variant="default" className="w-full">
              Connect to Supabase
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Click the green Supabase button in the top-right corner to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};