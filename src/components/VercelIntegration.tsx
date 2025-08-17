import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, ExternalLink, Plus, RefreshCw, Rocket, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Deployment {
  id: string;
  url: string;
  name: string;
  state: string;
  createdAt: string;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
}

interface VercelIntegrationProps {
  agentId?: string;
}

export const VercelIntegration: React.FC<VercelIntegrationProps> = ({ agentId }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [formData, setFormData] = useState({
    repository: '',
    framework: '',
    customDomain: '',
    envVars: '',
  });

  useEffect(() => {
    loadDeployments();
    loadRepositories();
  }, []);

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vercel-integration/list-deployments', {
        method: 'GET'
      });

      if (error) throw error;

      setDeployments(data.deployments || []);
    } catch (error) {
      console.error('Failed to load deployments:', error);
      toast.error('Failed to load deployments');
    } finally {
      setLoading(false);
    }
  };

  const loadRepositories = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('github-integration/list-repos', {
        method: 'GET'
      });

      if (error) throw error;

      setRepositories(data.repositories || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  };

  const deployProject = async () => {
    if (!formData.repository) {
      toast.error('Please select a repository');
      return;
    }

    setLoading(true);
    try {
      const selectedRepo = repositories.find(repo => repo.name === formData.repository);
      if (!selectedRepo) {
        throw new Error('Selected repository not found');
      }

      // Parse environment variables
      const envVars: Record<string, string> = {};
      if (formData.envVars.trim()) {
        formData.envVars.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        });
      }

      const { data, error } = await supabase.functions.invoke('vercel-integration/deploy', {
        body: {
          name: selectedRepo.name,
          gitUrl: selectedRepo.cloneUrl,
          framework: formData.framework || undefined,
          agentId,
          envVars: Object.keys(envVars).length > 0 ? envVars : undefined,
          customDomain: formData.customDomain || undefined,
        }
      });

      if (error) throw error;

      toast.success(`Project "${selectedRepo.name}" deployed successfully!`);
      setShowDeployDialog(false);
      setFormData({ repository: '', framework: '', customDomain: '', envVars: '' });
      loadDeployments();
    } catch (error) {
      console.error('Failed to deploy project:', error);
      toast.error('Failed to deploy project');
    } finally {
      setLoading(false);
    }
  };

  const setCustomDomain = async () => {
    if (!selectedDeployment || !formData.customDomain) {
      toast.error('Please enter a domain name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vercel-integration/set-domain', {
        body: {
          projectName: selectedDeployment.name,
          domain: formData.customDomain,
        }
      });

      if (error) throw error;

      toast.success(`Custom domain "${formData.customDomain}" set successfully!`);
      setShowDomainDialog(false);
      setFormData({ ...formData, customDomain: '' });
      setSelectedDeployment(null);
    } catch (error) {
      console.error('Failed to set custom domain:', error);
      toast.error('Failed to set custom domain');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'READY': return 'default';
      case 'BUILDING': return 'secondary';
      case 'ERROR': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vercel Integration</h3>
          <p className="text-sm text-muted-foreground">
            Deploy your GitHub repositories to Vercel with one click
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDeployments}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Deploy to Vercel</DialogTitle>
                <DialogDescription>
                  Select a GitHub repository to deploy to Vercel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repository">Repository</Label>
                  <Select onValueChange={(value) => handleInputChange('repository', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.name}>
                          {repo.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework (Optional)</Label>
                  <Select onValueChange={(value) => handleInputChange('framework', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nextjs">Next.js</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="vanilla">Vanilla HTML/JS</SelectItem>
                      <SelectItem value="static">Static Site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                  <Input
                    id="custom-domain"
                    value={formData.customDomain}
                    onChange={(e) => handleInputChange('customDomain', e.target.value)}
                    placeholder="yourdomain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="env-vars">Environment Variables (Optional)</Label>
                  <textarea
                    id="env-vars"
                    value={formData.envVars}
                    onChange={(e) => handleInputChange('envVars', e.target.value)}
                    placeholder="KEY1=value1&#10;KEY2=value2"
                    className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    One variable per line in KEY=value format
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={deployProject} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {deployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rocket className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No deployments found</h4>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Deploy your first GitHub repository to Vercel
            </p>
            <Button onClick={() => setShowDeployDialog(true)}>
              <Rocket className="w-4 h-4 mr-2" />
              Deploy Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deployments.map((deployment) => (
            <Card key={deployment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{deployment.name}</CardTitle>
                    <CardDescription>
                      Deployed {new Date(deployment.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStateColor(deployment.state)}>
                    {deployment.state}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live Site
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedDeployment(deployment);
                      setShowDomainDialog(true);
                    }}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Custom Domain
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(deployment.url);
                    toast.success('URL copied to clipboard');
                  }}>
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Domain Dialog */}
      <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Custom Domain</DialogTitle>
            <DialogDescription>
              Add a custom domain to your deployment: {selectedDeployment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={formData.customDomain}
                onChange={(e) => handleInputChange('customDomain', e.target.value)}
                placeholder="yourdomain.com"
              />
              <p className="text-xs text-muted-foreground">
                Make sure your domain's DNS points to Vercel
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDomainDialog(false)}>
              Cancel
            </Button>
            <Button onClick={setCustomDomain} disabled={loading}>
              {loading ? 'Setting...' : 'Set Domain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};