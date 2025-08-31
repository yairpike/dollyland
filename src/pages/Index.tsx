import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { KnowledgeUpload } from "@/components/KnowledgeUploadSection";
import { CTA } from "@/components/CTA";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { PageLoader } from "@/components/PageLoader";
import { Footer } from "@/components/Footer";
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
        <Features />
        <UseCases />
        <KnowledgeUpload />
        <MarketplaceSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
