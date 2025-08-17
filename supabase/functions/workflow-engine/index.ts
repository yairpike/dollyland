import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowStep {
  id: string
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'wait'
  config: any
  nextStep?: string
  conditions?: Array<{
    field: string
    operator: string
    value: any
    nextStep: string
  }>
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  currentStep: string
  context: Record<string, any>
  steps: WorkflowStep[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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

    switch (action) {
      case 'createWorkflow': {
        const { agentId, name, description, steps, triggers, isActive = true } = data
        
        const { data: workflow, error } = await supabaseClient
          .from('workflows')
          .insert({
            agent_id: agentId,
            name,
            description,
            steps,
            triggers,
            is_active: isActive,
            user_id: user.id
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create workflow: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ workflow }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'executeWorkflow': {
        const { workflowId, context = {}, triggerEvent } = data
        
        // Get workflow
        const { data: workflow, error: workflowError } = await supabaseClient
          .from('workflows')
          .select('*')
          .eq('id', workflowId)
          .eq('is_active', true)
          .single()

        if (workflowError) {
          throw new Error(`Failed to get workflow: ${workflowError.message}`)
        }

        // Create execution record
        const { data: execution, error: executionError } = await supabaseClient
          .from('workflow_executions')
          .insert({
            workflow_id: workflowId,
            status: 'running',
            context: { ...context, triggerEvent },
            current_step: workflow.steps[0]?.id,
            user_id: user.id
          })
          .select()
          .single()

        if (executionError) {
          throw new Error(`Failed to create execution: ${executionError.message}`)
        }

        // Start workflow execution in background
        EdgeRuntime.waitUntil(executeWorkflowSteps(execution, workflow, supabaseClient, req.headers.get('Authorization')!))

        return new Response(
          JSON.stringify({ execution }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'pauseExecution': {
        const { executionId } = data
        
        const { data: execution, error } = await supabaseClient
          .from('workflow_executions')
          .update({ status: 'paused' })
          .eq('id', executionId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to pause execution: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ execution }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'resumeExecution': {
        const { executionId } = data
        
        const { data: execution, error } = await supabaseClient
          .from('workflow_executions')
          .update({ status: 'running' })
          .eq('id', executionId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to resume execution: ${error.message}`)
        }

        // Get workflow and continue execution
        const { data: workflow, error: workflowError } = await supabaseClient
          .from('workflows')
          .select('*')
          .eq('id', execution.workflow_id)
          .single()

        if (workflowError) {
          throw new Error(`Failed to get workflow: ${workflowError.message}`)
        }

        // Resume workflow execution in background
        EdgeRuntime.waitUntil(executeWorkflowSteps(execution, workflow, supabaseClient, req.headers.get('Authorization')!))

        return new Response(
          JSON.stringify({ execution }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getExecutions': {
        const { workflowId, status, limit = 50 } = data
        
        let query = supabaseClient
          .from('workflow_executions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (workflowId) {
          query = query.eq('workflow_id', workflowId)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data: executions, error } = await query

        if (error) {
          throw new Error(`Failed to get executions: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ executions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getWorkflows': {
        const { agentId } = data
        
        const { data: workflows, error } = await supabaseClient
          .from('workflows')
          .select('*')
          .eq('agent_id', agentId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to get workflows: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ workflows }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Workflow engine error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function executeWorkflowSteps(
  execution: any,
  workflow: any,
  supabaseClient: any,
  authorization: string
) {
  try {
    let currentStepId = execution.current_step
    let context = execution.context
    let status = 'running'

    while (currentStepId && status === 'running') {
      // Check if execution is paused
      const { data: currentExecution } = await supabaseClient
        .from('workflow_executions')
        .select('status')
        .eq('id', execution.id)
        .single()

      if (currentExecution?.status === 'paused') {
        break
      }

      const step = workflow.steps.find((s: any) => s.id === currentStepId)
      if (!step) {
        status = 'failed'
        context.error = `Step ${currentStepId} not found`
        break
      }

      // Execute step
      const stepResult = await executeStep(step, context, supabaseClient, authorization)
      
      if (stepResult.error) {
        status = 'failed'
        context.error = stepResult.error
        break
      }

      // Update context with step result
      context = { ...context, ...stepResult.context }
      
      // Determine next step
      currentStepId = stepResult.nextStep || step.nextStep

      // Update execution progress
      await supabaseClient
        .from('workflow_executions')
        .update({
          current_step: currentStepId,
          context,
          status: currentStepId ? 'running' : 'completed'
        })
        .eq('id', execution.id)

      if (!currentStepId) {
        status = 'completed'
      }
    }

    // Final status update
    await supabaseClient
      .from('workflow_executions')
      .update({
        status,
        context,
        completed_at: status !== 'running' ? new Date().toISOString() : null
      })
      .eq('id', execution.id)

  } catch (error) {
    console.error('Workflow execution error:', error)
    await supabaseClient
      .from('workflow_executions')
      .update({
        status: 'failed',
        context: { ...execution.context, error: error.message },
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id)
  }
}

async function executeStep(step: WorkflowStep, context: any, supabaseClient: any, authorization: string) {
  try {
    switch (step.type) {
      case 'action': {
        const { actionType, parameters } = step.config
        
        // Call agent actions
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agent-actions`, {
          method: 'POST',
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'executeAction',
            agentId: context.agentId,
            actionType,
            parameters: { ...parameters, ...context }
          })
        })

        const result = await response.json()
        return {
          context: { lastActionResult: result },
          nextStep: step.nextStep
        }
      }

      case 'condition': {
        const { field, operator, value, trueStep, falseStep } = step.config
        const fieldValue = getNestedValue(context, field)
        
        let conditionMet = false
        switch (operator) {
          case 'equals':
            conditionMet = fieldValue === value
            break
          case 'not_equals':
            conditionMet = fieldValue !== value
            break
          case 'greater_than':
            conditionMet = fieldValue > value
            break
          case 'less_than':
            conditionMet = fieldValue < value
            break
          case 'contains':
            conditionMet = String(fieldValue).includes(value)
            break
        }

        return {
          context,
          nextStep: conditionMet ? trueStep : falseStep
        }
      }

      case 'wait': {
        const { duration } = step.config
        await new Promise(resolve => setTimeout(resolve, duration * 1000))
        
        return {
          context,
          nextStep: step.nextStep
        }
      }

      case 'loop': {
        const { iterations, loopStep } = step.config
        const currentIteration = context.loopIteration || 0
        
        if (currentIteration < iterations) {
          return {
            context: { ...context, loopIteration: currentIteration + 1 },
            nextStep: loopStep
          }
        } else {
          return {
            context: { ...context, loopIteration: 0 },
            nextStep: step.nextStep
          }
        }
      }

      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  } catch (error) {
    return {
      error: error.message,
      context
    }
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}