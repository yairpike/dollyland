import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

export const SupabaseNotice = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/5 to-neural/5">
      <div className="max-w-5xl mx-auto text-center">
        <Badge variant="outline" className="mb-6 text-primary border-primary/20 px-4 py-2">
          <Database className="w-4 h-4 mr-2" />
          Backend Integration Required
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Build Your
          <span className="bg-gradient-hero bg-clip-text text-transparent"> AI Workforce?</span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          To enable the full AI agent platform with user authentication, knowledge storage, 
          and agent management, connect your project to Supabase using our native integration.
        </p>
        
        <Card className="p-8 bg-gradient-card border border-primary/20 shadow-neural max-w-3xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">User signup, login, and session management</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neural/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-neural" />
              </div>
              <h3 className="font-semibold mb-2">Knowledge Storage</h3>
              <p className="text-sm text-muted-foreground">Secure storage for your expertise and agents</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-agent-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-agent-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-muted-foreground">Backend APIs for knowledge analysis and agent creation</p>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              What you'll get with Supabase integration:
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>User registration & authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Knowledge base storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Agent creation & management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Real-time chat functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>File upload & processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Secure API endpoints</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click the green Supabase button in the top-right corner to activate the integration
            </p>
            <Button variant="default" size="lg" className="text-lg">
              <Database className="w-5 h-5" />
              Connect to Supabase
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};