import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  CreditCard,
  Target,
  Award
} from "lucide-react";

interface CreatorEarning {
  id: string;
  agent_id: string;
  agent_name: string;
  total_earnings_cents: number;
  total_conversations: number;
  pending_payout_cents: number;
  last_payout_at?: string;
}

interface PayoutRequest {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  processed_at?: string;
}

interface EarningsAnalytics {
  total_earnings: number;
  monthly_earnings: number;
  total_conversations: number;
  monthly_conversations: number;
  top_agents: Array<{
    agent_name: string;
    earnings: number;
    conversations: number;
  }>;
}

export const CreatorEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<CreatorEarning[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [analytics, setAnalytics] = useState<EarningsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [minPayoutAmount] = useState(1000); // $10 minimum payout

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchPayoutRequests();
      fetchAnalytics();
    }
  }, [user]);

  const fetchEarnings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_earnings')
        .select(`
          *,
          agent:agents(name)
        `)
        .eq('creator_id', user.id)
        .order('total_earnings_cents', { ascending: false });

      if (error) throw error;

      const earningsWithNames = data?.map(earning => ({
        ...earning,
        agent_name: earning.agent?.name || 'Unknown Agent'
      })) || [];

      setEarnings(earningsWithNames);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('creator_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      // Calculate analytics from earnings data
      const totalEarnings = earnings.reduce((sum, e) => sum + e.total_earnings_cents, 0);
      const totalConversations = earnings.reduce((sum, e) => sum + e.total_conversations, 0);
      
      // Get monthly data (simplified - in production, use proper date filtering)
      const monthlyEarnings = totalEarnings * 0.3; // Simplified calculation
      const monthlyConversations = totalConversations * 0.3;
      
      const topAgents = earnings
        .slice(0, 5)
        .map(e => ({
          agent_name: e.agent_name,
          earnings: e.total_earnings_cents / 100,
          conversations: e.total_conversations
        }));

      setAnalytics({
        total_earnings: totalEarnings / 100,
        monthly_earnings: monthlyEarnings / 100,
        total_conversations: totalConversations,
        monthly_conversations: Math.round(monthlyConversations),
        top_agents: topAgents
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  };

  const requestPayout = async () => {
    if (!user) return;

    const totalPending = earnings.reduce((sum, e) => sum + e.pending_payout_cents, 0);
    
    if (totalPending < minPayoutAmount) {
      toast.error(`Minimum payout amount is $${minPayoutAmount / 100}`);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: {
          action: 'request',
          creator_id: user.id,
          amount_cents: totalPending
        }
      });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      fetchEarnings();
      fetchPayoutRequests();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Failed to submit payout request');
    }
  };

  const exportEarningsData = () => {
    const csvData = earnings.map(e => ({
      'Agent Name': e.agent_name,
      'Total Earnings': `$${(e.total_earnings_cents / 100).toFixed(2)}`,
      'Conversations': e.total_conversations,
      'Pending Payout': `$${(e.pending_payout_cents / 100).toFixed(2)}`,
      'Last Payout': e.last_payout_at ? new Date(e.last_payout_at).toLocaleDateString() : 'Never'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPendingPayout = earnings.reduce((sum, e) => sum + e.pending_payout_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Creator Earnings</h3>
          <p className="text-sm text-muted-foreground">
            Track your earnings from agent usage and manage payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportEarningsData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={requestPayout}
            disabled={totalPendingPayout < minPayoutAmount}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ${analytics?.total_earnings.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">
                  ${analytics?.monthly_earnings.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Usage</p>
                <p className="text-2xl font-bold">
                  {analytics?.total_conversations || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending Payout</p>
                <p className="text-2xl font-bold">
                  ${(totalPendingPayout / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="w-full">
        <TabsList>
          <TabsTrigger value="earnings">Agent Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          {earnings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No earnings yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start earning by creating popular agents that users love to interact with
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {earnings.map((earning) => (
                <Card key={earning.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Award className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{earning.agent_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {earning.total_conversations} conversations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(earning.total_earnings_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pending: ${(earning.pending_payout_cents / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPendingPayout >= minPayoutAmount && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Ready for Payout</h4>
                    <p className="text-sm text-green-600">
                      You have ${(totalPendingPayout / 100).toFixed(2)} available for payout
                    </p>
                  </div>
                  <Button onClick={requestPayout}>
                    Request Payout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          {payoutRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payout requests</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your payout requests will appear here once you request them
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payoutRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          ${(request.amount_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'failed' ? 'bg-red-100 text-red-800' :
                          request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>Agents generating the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.top_agents?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {analytics?.top_agents?.map((agent, index) => (
                      <div key={agent.agent_name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{agent.agent_name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${agent.earnings.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.conversations} conversations
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Revenue share breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Creator Share (80%)</span>
                    <span className="font-semibold">
                      ${((analytics?.total_earnings || 0) * 0.8).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Share (20%)</span>
                    <span className="font-semibold">
                      ${((analytics?.total_earnings || 0) * 0.2).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Revenue</span>
                      <span>${analytics?.total_earnings.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};