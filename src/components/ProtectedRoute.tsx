import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when we're sure there's no user and not initializing
    if (!initializing && !loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, initializing, navigate]);

  // Show loading during initialization or auth state changes
  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-muted-foreground">
            {initializing ? "Initializing..." : "Authenticating..."}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
};