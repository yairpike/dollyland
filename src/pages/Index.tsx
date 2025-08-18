import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AgentShowcase } from "@/components/AgentShowcase";
import { KnowledgeUpload } from "@/components/KnowledgeUpload";
import { SupabaseConnectionNotice } from "@/components/SupabaseConnectionNotice";
import { PageLoader } from "@/components/PageLoader";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <PageLoader message="Loading..." />;
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
