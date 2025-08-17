import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ExternalLink, Plus, Search, Filter, RefreshCw, Calendar, User, Tag } from 'lucide-react'

interface LinearTeam {
  id: string
  name: string
  description?: string
  states: Array<{
    id: string
    name: string
    color: string
    type: string
  }>
}

interface LinearIssue {
  id: string
  identifier: string
  title: string
  description?: string
  url: string
  state: {
    name: string
    color: string
    type: string
  }
  assignee?: {
    name: string
    email: string
  }
  team: {
    name: string
  }
  labels?: Array<{
    name: string
    color: string
  }>
  createdAt: string
  updatedAt: string
}

interface LinearIntegrationProps {
  agentId: string
}

export const LinearIntegration: React.FC<LinearIntegrationProps> = ({ agentId }) => {
  const [teams, setTeams] = useState<LinearTeam[]>([])
  const [issues, setIssues] = useState<LinearIssue[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [createIssueOpen, setCreateIssueOpen] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    teamId: '',
    priority: 1
  })
  const { toast } = useToast()

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('linear-integration', {
        body: {
          action: 'getTeams'
        }
      })

      if (error) throw error

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setTeams(data.data.teams.nodes)
      if (data.data.teams.nodes.length > 0 && !selectedTeam) {
        setSelectedTeam(data.data.teams.nodes[0].id)
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching teams',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchIssues = async (teamId?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('linear-integration', {
        body: {
          action: 'getIssues',
          data: {
            teamId: teamId || selectedTeam,
            limit: 50
          }
        }
      })

      if (error) throw error

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setIssues(data.data.issues.nodes)
    } catch (error: any) {
      toast({
        title: 'Error fetching issues',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const searchIssues = async () => {
    if (!searchQuery.trim()) {
      fetchIssues()
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('linear-integration', {
        body: {
          action: 'searchIssues',
          data: {
            query: searchQuery,
            limit: 20
          }
        }
      })

      if (error) throw error

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setIssues(data.data.searchIssues.nodes)
    } catch (error: any) {
      toast({
        title: 'Error searching issues',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createIssue = async () => {
    if (!newIssue.title || !newIssue.teamId) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in title and select a team',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('linear-integration', {
        body: {
          action: 'createIssue',
          data: {
            teamId: newIssue.teamId,
            title: newIssue.title,
            description: newIssue.description,
            priority: newIssue.priority
          }
        }
      })

      if (error) throw error

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      if (data.data.issueCreate.success) {
        toast({
          title: 'Issue created successfully',
          description: `Created ${data.data.issueCreate.issue.identifier}: ${data.data.issueCreate.issue.title}`
        })
        setCreateIssueOpen(false)
        setNewIssue({ title: '', description: '', teamId: '', priority: 1 })
        fetchIssues()
      }
    } catch (error: any) {
      toast({
        title: 'Error creating issue',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchIssues()
    }
  }, [selectedTeam])

  const getStateColor = (color: string) => {
    return `hsl(${parseInt(color?.replace('#', ''), 16) % 360}, 70%, 50%)`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Linear Integration
          </CardTitle>
          <CardDescription>
            Manage Linear issues and teams directly from your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchIssues()}
                  />
                  <Button onClick={searchIssues} disabled={loading}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={() => fetchIssues()} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>

                <Dialog open={createIssueOpen} onOpenChange={setCreateIssueOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Issue</DialogTitle>
                      <DialogDescription>
                        Create a new issue in your Linear workspace
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Team</Label>
                        <Select value={newIssue.teamId} onValueChange={(value) => 
                          setNewIssue(prev => ({ ...prev, teamId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newIssue.title}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Issue title"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newIssue.description}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Issue description"
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label>Priority</Label>
                        <Select value={newIssue.priority.toString()} onValueChange={(value) => 
                          setNewIssue(prev => ({ ...prev, priority: parseInt(value) }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Low</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">High</SelectItem>
                            <SelectItem value="4">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateIssueOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createIssue} disabled={loading}>
                          Create Issue
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <Card key={issue.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.identifier}
                            </Badge>
                            <Badge 
                              style={{ 
                                backgroundColor: getStateColor(issue.state.color),
                                color: 'white'
                              }}
                            >
                              {issue.state.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {issue.team.name}
                            </span>
                          </div>
                          
                          <h4 className="font-medium mb-1">{issue.title}</h4>
                          
                          {issue.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {issue.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {issue.assignee && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {issue.assignee.name}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {issue.labels && issue.labels.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {issue.labels.map((label, index) => (
                                <Badge 
                                  key={index}
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ backgroundColor: label.color + '20' }}
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <a href={issue.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {issues.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No issues found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Teams ({teams.length})</h3>
                <Button onClick={fetchTeams} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {teams.map((team) => (
                    <Card key={team.id} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          {team.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {team.description}
                            </p>
                          )}
                        </div>
                        
                        {team.states && team.states.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">States:</p>
                            <div className="flex flex-wrap gap-1">
                              {team.states.map((state) => (
                                <Badge 
                                  key={state.id}
                                  style={{ 
                                    backgroundColor: getStateColor(state.color),
                                    color: 'white'
                                  }}
                                >
                                  {state.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}