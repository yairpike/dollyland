import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AgentShowcase } from "@/components/AgentShowcase";
import { KnowledgeUpload } from "@/components/KnowledgeUpload";
import { SupabaseConnectionNotice } from "@/components/SupabaseConnectionNotice";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isSupabaseConfigured()) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show connection notice if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return <SupabaseConnectionNotice />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AgentShowcase />
        <KnowledgeUpload />
      </main>
    </div>
  );
};

export default Index;
