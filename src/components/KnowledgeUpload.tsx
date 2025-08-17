import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Video, 
  Mic, 
  Link, 
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const uploadTypes = [
  {
    icon: FileText,
    title: "Documents & Files",
    description: "PDFs, docs, presentations, and text files",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Video,
    title: "Video Content",
    description: "Training videos, meetings, and presentations",
    color: "text-neural",
    bgColor: "bg-neural/10"
  },
  {
    icon: Mic,
    title: "Audio Records",
    description: "Podcasts, interviews, and voice notes",
    color: "text-agent-primary",
    bgColor: "bg-agent-primary/10"
  },
  {
    icon: Link,
    title: "Web Content",
    description: "Websites, articles, and online resources",
    color: "text-agent-secondary",
    bgColor: "bg-agent-secondary/10"
  }
];

const features = [
  "AI-powered content analysis",
  "Knowledge graph generation", 
  "Context preservation",
  "Multi-format processing",
  "Secure encryption"
];

export const KnowledgeUpload = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-accent/10 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="animate-slide-up">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">
              <Brain className="w-4 h-4 mr-2" />
              Knowledge Ingestion
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Upload Your
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Expertise
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Our advanced AI processes your knowledge from any format—documents, videos, audio files, 
              or web content. Your expertise becomes the foundation for intelligent, personalized agents.
            </p>
            
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button variant="hero" size="lg" className="text-lg">
              <Upload className="w-5 h-5" />
              Start Knowledge Upload
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Upload Interface Side */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="p-8 bg-gradient-card border-0 shadow-neural">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Knowledge Upload Center</h3>
                <p className="text-muted-foreground">Choose your content type to begin</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {uploadTypes.map((type, index) => (
                  <Card 
                    key={type.title}
                    className="p-4 cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group border border-border/50"
                  >
                    <div className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{type.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{type.description}</p>
                  </Card>
                ))}
              </div>
              
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors duration-300 cursor-pointer group">
                <Upload className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-foreground font-medium mb-2">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button variant="neural" size="sm">
                  Choose Files
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};