import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GitBranch, ExternalLink, Plus, RefreshCw, Folder } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
}

interface GitHubIntegrationProps {
  agentId?: string;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ agentId }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    private: false,
    template: '',
  });

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration/list-repos', {
        method: 'GET'
      });

      if (error) throw error;

      setRepositories(data.repositories || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      toast.error('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const createRepository = async () => {
    if (!formData.name.trim()) {
      toast.error('Repository name is required');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-integration/create-repo', {
        body: {
          name: formData.name,
          description: formData.description,
          private: formData.private,
          agentId,
          template: formData.template || undefined,
        }
      });

      if (error) throw error;

      toast.success(`Repository "${data.repository.name}" created successfully!`);
      setShowCreateDialog(false);
      setFormData({ name: '', description: '', private: false, template: '' });
      loadRepositories();
    } catch (error) {
      console.error('Failed to create repository:', error);
      toast.error('Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Create and manage repositories for your AI agent projects
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRepositories}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Repository</DialogTitle>
                <DialogDescription>
                  Create a new GitHub repository for your AI agent project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="my-ai-project"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-description">Description (Optional)</Label>
                  <Textarea
                    id="repo-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="A project created by my AI agent"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-template">Project Template</Label>
                  <Select onValueChange={(value) => handleInputChange('template', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React App</SelectItem>
                      <SelectItem value="nextjs">Next.js App</SelectItem>
                      <SelectItem value="vanilla">Vanilla HTML/JS</SelectItem>
                      <SelectItem value="node">Node.js API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="repo-private"
                    checked={formData.private}
                    onChange={(e) => handleInputChange('private', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="repo-private">Make repository private</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createRepository} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Repository'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {repositories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="w-12 h-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No repositories found</h4>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create your first repository to start building with AI agents
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Repository
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo) => (
              <Card key={repo.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        {repo.fullName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {repo.defaultBranch}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(repo.cloneUrl);
                      toast.success('Clone URL copied to clipboard');
                    }}>
                      Copy Clone URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};