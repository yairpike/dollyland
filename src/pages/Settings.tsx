import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AIProviderManager } from "@/components/AIProviderManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { User, CreditCard, Bot, Palette } from "lucide-react";
import { toast } from "sonner";

export const Settings = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSaveProfile = async () => {
    // Profile update functionality would go here
    toast.success("Profile updated successfully");
  };

  const handleManagePayment = () => {
    // Payment management functionality would go here
    toast.info("Payment management coming soon");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="ai-providers" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Providers
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
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

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Providers Settings */}
          <TabsContent value="ai-providers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Provider Settings</CardTitle>
                <CardDescription>
                  Configure your AI providers and API keys for your agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIProviderManager />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Current Plan</h4>
                      <p className="text-sm text-muted-foreground">Free Plan</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basic features with limited usage
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Usage This Month</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>API Calls</span>
                          <span>150 / 1,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Agents Created</span>
                          <span>3 / 10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Payment Method</h4>
                      <p className="text-sm text-muted-foreground">No payment method on file</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Next Billing Date</h4>
                      <p className="text-sm text-muted-foreground">N/A - Free Plan</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="default" onClick={handleManagePayment}>
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" onClick={handleManagePayment}>
                    Manage Payment Methods
                  </Button>
                </div>

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};