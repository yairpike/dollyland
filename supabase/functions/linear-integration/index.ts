import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"

interface LinearIssue {
  id: string
  title: string
  description?: string
  state?: {
    name: string
    id: string
  }
  team?: {
    name: string
    id: string
  }
  assignee?: {
    name: string
    email: string
  }
  labels?: Array<{
    name: string
    color: string
  }>
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(req)
  if (preflightResponse) return preflightResponse

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { action, data } = await req.json()
    const linearApiKey = Deno.env.get('LINEAR_API_KEY')

    if (!linearApiKey) {
      return new Response(
        JSON.stringify({ error: 'Linear API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const linearHeaders = {
      'Authorization': linearApiKey,
      'Content-Type': 'application/json',
    }

    let result

    switch (action) {
      case 'getTeams': {
        const query = `
          query {
            teams {
              nodes {
                id
                name
                description
                states {
                  nodes {
                    id
                    name
                    color
                    type
                  }
                }
              }
            }
          }
        `
        
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: linearHeaders,
          body: JSON.stringify({ query })
        })
        
        result = await response.json()
        break
      }

      case 'createIssue': {
        const { teamId, title, description, assigneeId, priority, labelIds } = data
        
        const mutation = `
          mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                title
                identifier
                url
                state {
                  name
                }
                team {
                  name
                }
              }
            }
          }
        `
        
        const variables = {
          input: {
            teamId,
            title,
            description,
            assigneeId,
            priority,
            labelIds
          }
        }
        
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: linearHeaders,
          body: JSON.stringify({ query: mutation, variables })
        })
        
        result = await response.json()
        break
      }

      case 'getIssues': {
        const { teamId, limit = 20 } = data
        
        const query = `
          query Issues($filter: IssueFilter, $first: Int) {
            issues(filter: $filter, first: $first) {
              nodes {
                id
                title
                identifier
                description
                url
                state {
                  name
                  color
                  type
                }
                assignee {
                  name
                  email
                }
                team {
                  name
                }
                labels {
                  nodes {
                    name
                    color
                  }
                }
                createdAt
                updatedAt
              }
            }
          }
        `
        
        const variables = {
          filter: teamId ? { team: { id: { eq: teamId } } } : {},
          first: limit
        }
        
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: linearHeaders,
          body: JSON.stringify({ query, variables })
        })
        
        result = await response.json()
        break
      }

      case 'updateIssue': {
        const { issueId, stateId, assigneeId, priority, title, description } = data
        
        const mutation = `
          mutation IssueUpdate($input: IssueUpdateInput!) {
            issueUpdate(input: $input) {
              success
              issue {
                id
                title
                state {
                  name
                }
              }
            }
          }
        `
        
        const variables = {
          input: {
            id: issueId,
            stateId,
            assigneeId,
            priority,
            title,
            description
          }
        }
        
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: linearHeaders,
          body: JSON.stringify({ query: mutation, variables })
        })
        
        result = await response.json()
        break
      }

      case 'searchIssues': {
        const { query: searchQuery, limit = 10 } = data
        
        const query = `
          query SearchIssues($query: String!, $first: Int) {
            searchIssues(query: $query, first: $first) {
              nodes {
                id
                title
                identifier
                description
                url
                state {
                  name
                  color
                }
                team {
                  name
                }
                assignee {
                  name
                }
              }
            }
          }
        `
        
        const variables = {
          query: searchQuery,
          first: limit
        }
        
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: linearHeaders,
          body: JSON.stringify({ query, variables })
        })
        
        result = await response.json()
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    // Log the integration usage
    EdgeRuntime.waitUntil(
      supabaseClient
        .from('integration_logs')
        .insert({
          user_id: user.id,
          integration_type: 'linear',
          action,
          success: !result.errors,
          metadata: { action, success: !result.errors }
        })
    )

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Linear integration error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})