import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIProviderManager } from "@/components/AIProviderManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardLayout } from "@/components/DashboardLayout";
import { InviteManager } from "@/components/InviteManager";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { User, CreditCard, Bot, LogOut, Mail, GraduationCap, PlayCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTourManager } from "@/components/OnboardingTour";

export const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { resetTours } = useTourManager();
  const { subscription, loading: subscriptionLoading, isSubscribed, plan } = useSubscription();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, full_name')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setFullName(data.full_name || "");
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const combinedFullName = `${firstName} ${lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: combinedFullName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error("Failed to update profile");
        console.error("Profile update error:", error);
      } else {
        setFullName(combinedFullName);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === email) {
      toast.error("Please enter a different email address");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Check your new email to confirm the change.");
        setShowEmailChange(false);
        setNewEmail("");
      }
    } catch (error) {
      toast.error("Failed to update email. Please try again.");
    }
  };

  const handleUpgradePlan = () => {
    navigate('/pricing');
  };

  const handleManagePayment = async () => {
    if (!isSubscribed) {
      toast.error('You need an active subscription to manage payment methods');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open payment management');
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Settings: Starting sign out process');
      const { error } = await signOut();
      
      if (error) {
        console.error('Settings: Sign out error:', error);
        // Even if there's an error, try to clear state and redirect
        localStorage.clear();
        navigate("/auth", { replace: true });
        toast.error("Sign out completed with issues - you have been logged out");
      } else {
        console.log('Settings: Sign out successful');
        toast.success("Signed out successfully");
        localStorage.clear();
        navigate("/auth", { replace: true });
      }
    } catch (err) {
      console.error('Settings: Unexpected sign out error:', err);
      // Force sign out by clearing everything
      localStorage.clear();
      navigate("/auth", { replace: true });
      toast.info("Signed out (forced)");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground mb-6">Manage your account and preferences</p>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="flex w-full overflow-x-auto bg-card border py-2 h-12 items-center justify-start gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="account" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-32 flex-1">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="ai-providers" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-32 flex-1">
              <Bot className="w-4 h-4" />
              AI Providers
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-32 flex-1">
              <GraduationCap className="w-4 h-4" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-32 flex-1">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-32 flex-1">
              <User className="w-4 h-4" />
              Invites
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted flex-1 h-9"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowEmailChange(true)}
                        className="flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Account Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account is active and in good standing
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">Active</div>
                    <div className="text-xs text-muted-foreground">
                      Member since {new Date(user?.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Account Actions</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account settings
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>

                <div className="flex justify-start">
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Providers Settings */}
          <TabsContent value="ai-providers" className="mt-6 space-y-6">
            <AIProviderManager />
          </TabsContent>

          {/* Tutorials Settings */}
          <TabsContent value="tutorials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tutorial Management</CardTitle>
                <CardDescription>
                  Replay onboarding tours and learn about platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Dashboard Tour</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn about your dashboard features, stats, and agent management
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigate('/dashboard');
                        setTimeout(() => {
                          localStorage.removeItem('tour_dashboard_completed');
                          window.location.reload();
                        }, 100);
                      }}
                    >
                      Start Tour
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Create Agent Tour</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Step-by-step guide to creating your first AI agent
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigate('/create-agent');
                        setTimeout(() => {
                          localStorage.removeItem('tour_create-agent_completed');
                          window.location.reload();
                        }, 100);
                      }}
                    >
                      Start Tour
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Edit Agent Tour</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn to configure agents, set up integrations, and manage workflows
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigate('/dashboard');
                        toast.info('Create or select an agent first, then click edit to start the tour');
                      }}
                    >
                      Start Tour
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <RotateCcw className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Reset All Tours</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Reset all tutorial progress and see tours again
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        resetTours();
                        toast.success('All tours have been reset. They will appear when you visit their respective pages.');
                      }}
                    >
                      Reset Tours
                    </Button>
                  </Card>
                </div>


                <div className="bg-muted rounded-lg p-4 hidden">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Learning Resources
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Getting Started</div>
                      <div className="text-muted-foreground">Learn the basics of agent creation</div>
                    </div>
                    <div>
                      <div className="font-medium">Advanced Features</div>
                      <div className="text-muted-foreground">Integrations, workflows, and more</div>
                    </div>
                    <div>
                      <div className="font-medium">Best Practices</div>
                      <div className="text-muted-foreground">Tips for effective agent management</div>
                    </div>
                    <div>
                      <div className="font-medium">Troubleshooting</div>
                      <div className="text-muted-foreground">Common issues and solutions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading subscription data...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Current Plan</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan?.name || 'Free Plan'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isSubscribed 
                              ? `Active subscription with ${plan?.features?.length || 0} features`
                              : 'Basic features with limited usage'
                            }
                          </p>
                          {subscription?.subscription_end && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expires: {new Date(subscription.subscription_end).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Plan Features</h4>
                          <div className="mt-2 space-y-1">
                            {plan?.features?.slice(0, 3).map((feature, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                • {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Payment Method</h4>
                          <p className="text-sm text-muted-foreground">
                            {isSubscribed ? 'Payment method on file' : 'No payment method on file'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Subscription Status</h4>
                          <p className="text-sm text-muted-foreground">
                            {isSubscribed ? 'Active Subscription' : 'Free Plan'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-4">
                      {!isSubscribed ? (
                        <Button variant="default" onClick={handleUpgradePlan}>
                          Upgrade Plan
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={handleManagePayment}>
                          Manage Payment Methods
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="bg-muted rounded-lg p-4">
                  <h5 className="font-medium mb-2">Available Plans</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Free</div>
                      <div className="text-muted-foreground">$0/month</div>
                      <div className="text-xs">Basic features</div>
                    </div>
                    <div>
                      <div className="font-medium">Pro</div>
                      <div className="text-muted-foreground">$19/month</div>
                      <div className="text-xs">Advanced features</div>
                    </div>
                    <div>
                      <div className="font-medium">Enterprise</div>
                      <div className="text-muted-foreground">$99/month</div>
                      <div className="text-xs">Full access</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites">
            <InviteManager />
          </TabsContent>
        </Tabs>

        {/* Email Change Dialog */}
        <Dialog open={showEmailChange} onOpenChange={setShowEmailChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Email Address</DialogTitle>
              <DialogDescription>
                Enter your new email address. You'll need to verify it before the change takes effect.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input
                  id="current-email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangeEmail} disabled={!newEmail}>
                Send Verification Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};