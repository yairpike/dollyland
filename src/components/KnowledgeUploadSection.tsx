import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Zap, Brain, ArrowRight } from "lucide-react";

const uploadFeatures = [
  {
    icon: FileText,
    title: "Documents & PDFs",
    description: "Upload training materials, manuals, and knowledge bases"
  },
  {
    icon: Brain,
    title: "AI Training",
    description: "Our AI learns from your content to create specialized agents"
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Your trained agents are ready to use in minutes"
  }
];

export const KnowledgeUpload = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Knowledge Upload</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Train AI Agents with
            <span className="block bg-gradient-primary bg-clip-text text-transparent">Your Expertise</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload your knowledge base and watch AI agents learn from your expertise. From PDFs to custom datasets, we handle it all.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {uploadFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up group text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-agent border border-primary/20 max-w-md">
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Ready to Start?</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first knowledge base and create your AI agent in minutes.
            </p>
            <Button variant="default" onClick={() => navigate('/auth')} className="w-full">
              Start Uploading
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};