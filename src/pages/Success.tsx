import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status
    const refreshSubscription = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
        toast.success('Subscription activated successfully!');
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    };

    if (sessionId) {
      refreshSubscription();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
              <CardDescription className="text-lg">
                Your subscription has been activated and you're ready to start creating amazing AI agents.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">What's next?</h3>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li>• Create unlimited AI agents</li>
                  <li>• Start earning from agent conversations</li>
                  <li>• Access advanced analytics and insights</li>
                  <li>• Get priority support</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/create-agent')}
                >
                  Create Your First Agent
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                You'll receive a confirmation email shortly. If you have any questions, our support team is here to help.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Success;