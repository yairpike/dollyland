import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AgentShowcase } from "@/components/AgentShowcase";
import { KnowledgeUpload } from "@/components/KnowledgeUpload";
import { SupabaseNotice } from "@/components/SupabaseNotice";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AgentShowcase />
        <KnowledgeUpload />
        <SupabaseNotice />
      </main>
    </div>
  );
};

export default Index;
