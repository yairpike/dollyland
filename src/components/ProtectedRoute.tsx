import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/PageLoader";

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
      <PageLoader 
        message={initializing ? "Initializing..." : "Authenticating..."} 
      />
    );
  }

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
};