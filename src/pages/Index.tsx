import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { SocialProof } from "@/components/SocialProof";
import { CTA } from "@/components/CTA";
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
        <Features />
        <UseCases />
        <SocialProof />
        <CTA />
      </main>
    </div>
  );
};

export default Index;
