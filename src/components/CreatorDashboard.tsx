import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, MessageSquare, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface CreatorEarning {
  id: string;
  agent_id: string;
  total_earnings_cents: number;
  total_conversations: number;
  pending_payout_cents: number;
  last_payout_at: string | null;
  agents: {
    name: string;
    rating: number;
    user_count: number;
  };
}

interface PayoutRequest {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
}

export const CreatorDashboard = () => {
  const [earnings, setEarnings] = useState<CreatorEarning[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchPayouts();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_earnings')
        .select(`
          *,
          agents (
            name,
            rating,
            user_count
          )
        `)
        .eq('creator_id', user?.id);

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('creator_id', user?.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const requestPayout = async () => {
    if (!user) return;

    const totalPending = earnings.reduce((sum, earning) => sum + earning.pending_payout_cents, 0);
    
    if (totalPending < 1000) { // $10 minimum
      toast.error('Minimum payout amount is $10.00');
      return;
    }

    setPayoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { amount_cents: totalPending }
      });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      fetchEarnings();
      fetchPayouts();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to process payout request');
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTotalStats = () => {
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.total_earnings_cents, 0);
    const totalConversations = earnings.reduce((sum, earning) => sum + earning.total_conversations, 0);
    const totalPending = earnings.reduce((sum, earning) => sum + earning.pending_payout_cents, 0);
    
    return { totalEarnings, totalConversations, totalPending };
  };

  const { totalEarnings, totalConversations, totalPending } = getTotalStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground">Track your agent performance and earnings</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              80% revenue share
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum $10 for payout
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Agent Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Agent Performance</h2>
            <Button 
              onClick={requestPayout} 
              disabled={totalPending < 1000 || payoutLoading}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {payoutLoading ? 'Processing...' : `Request Payout (${formatCurrency(totalPending)})`}
            </Button>
          </div>

          <div className="grid gap-4">
            {earnings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No earnings yet. Create and publish agents to start earning!</p>
                </CardContent>
              </Card>
            ) : (
              earnings.map((earning) => (
                <Card key={earning.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{earning.agents.name}</CardTitle>
                        <CardDescription>
                          {earning.total_conversations} conversations • Rating: {earning.agents.rating}/5
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(earning.total_earnings_cents)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pending: {formatCurrency(earning.pending_payout_cents)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payout Progress</span>
                        <span>{formatCurrency(earning.pending_payout_cents)} / $10.00</span>
                      </div>
                      <Progress 
                        value={Math.min((earning.pending_payout_cents / 1000) * 100, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        ${((1000 - earning.pending_payout_cents) / 100).toFixed(2)} until next payout eligibility
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <h2 className="text-xl font-semibold">Payout History</h2>
          
          <div className="grid gap-4">
            {payouts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No payout requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              payouts.map((payout) => (
                <Card key={payout.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{formatCurrency(payout.amount_cents)}</div>
                        <div className="text-sm text-muted-foreground">
                          Requested {new Date(payout.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={
                        payout.status === 'completed' ? 'default' :
                        payout.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {payout.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};