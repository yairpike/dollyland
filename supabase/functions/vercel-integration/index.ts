import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

interface DeploymentRequest {
  name: string;
  gitUrl: string;
  framework?: 'nextjs' | 'react' | 'vanilla' | 'static';
  agentId?: string;
  envVars?: Record<string, string>;
  customDomain?: string;
}

interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state: string;
  createdAt: number;
}

const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'deploy':
        return await deployProject(req, user.id);
      case 'list-deployments':
        return await listDeployments();
      case 'get-deployment':
        return await getDeployment(req);
      case 'set-domain':
        return await setCustomDomain(req);
      case 'add-env-vars':
        return await addEnvironmentVariables(req);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Vercel integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function deployProject(req: Request, userId: string): Promise<Response> {
  const { name, gitUrl, framework, agentId, envVars, customDomain }: DeploymentRequest = await req.json();

  if (!name || !gitUrl) {
    throw new Error('Project name and Git URL are required');
  }

  // Detect framework from Git URL if not specified
  const detectedFramework = framework || await detectFramework(gitUrl);

  // Create deployment on Vercel
  const deploymentBody = {
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    gitSource: {
      type: 'github',
      repo: gitUrl.replace('https://github.com/', '').replace('.git', ''),
      ref: 'main'
    },
    projectSettings: {
      framework: getVercelFramework(detectedFramework),
      buildCommand: getBuildCommand(detectedFramework),
      outputDirectory: getOutputDirectory(detectedFramework),
    },
    env: envVars || {},
  };

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deploymentBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Vercel API error: ${error.error?.message || 'Unknown error'}`);
  }

  const deployment: VercelDeployment = await response.json();

  // Set custom domain if provided
  if (customDomain) {
    await setProjectDomain(deployment.name, customDomain);
  }

  console.log(`Deployment created: ${deployment.url} for user ${userId}`);

  return new Response(JSON.stringify({
    success: true,
    deployment: {
      id: deployment.id,
      url: `https://${deployment.url}`,
      name: deployment.name,
      state: deployment.state,
      createdAt: new Date(deployment.createdAt).toISOString(),
    },
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listDeployments(): Promise<Response> {
  const response = await fetch('https://api.vercel.com/v6/deployments?limit=20', {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Vercel API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  return new Response(JSON.stringify({
    deployments: data.deployments.map((deployment: VercelDeployment) => ({
      id: deployment.id,
      url: `https://${deployment.url}`,
      name: deployment.name,
      state: deployment.state,
      createdAt: new Date(deployment.createdAt).toISOString(),
    })),
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getDeployment(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const deploymentId = url.searchParams.get('id');

  if (!deploymentId) {
    throw new Error('Deployment ID is required');
  }

  const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Vercel API error: ${error.error?.message || 'Unknown error'}`);
  }

  const deployment = await response.json();

  return new Response(JSON.stringify({
    deployment: {
      id: deployment.id,
      url: `https://${deployment.url}`,
      name: deployment.name,
      state: deployment.state,
      createdAt: new Date(deployment.createdAt).toISOString(),
    },
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function setCustomDomain(req: Request): Promise<Response> {
  const { projectName, domain } = await req.json();

  if (!projectName || !domain) {
    throw new Error('Project name and domain are required');
  }

  await setProjectDomain(projectName, domain);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function setProjectDomain(projectName: string, domain: string): Promise<void> {
  const response = await fetch(`https://api.vercel.com/v9/projects/${projectName}/domains`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to set domain ${domain}:`, error);
    throw new Error(`Failed to set custom domain: ${error.error?.message || 'Unknown error'}`);
  }
}

async function addEnvironmentVariables(req: Request): Promise<Response> {
  const { projectName, envVars } = await req.json();

  if (!projectName || !envVars) {
    throw new Error('Project name and environment variables are required');
  }

  // Add environment variables to project
  for (const [key, value] of Object.entries(envVars)) {
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectName}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
        target: ['production', 'preview', 'development'],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to add env var ${key}:`, error);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function detectFramework(gitUrl: string): Promise<string> {
  // Simple framework detection based on common patterns
  // In a real implementation, you might clone the repo and check package.json
  const repoName = gitUrl.split('/').pop()?.toLowerCase() || '';
  
  if (repoName.includes('next')) return 'nextjs';
  if (repoName.includes('react')) return 'react';
  if (repoName.includes('vue')) return 'vue';
  if (repoName.includes('node') || repoName.includes('api')) return 'node';
  
  return 'static'; // Default fallback
}

function getVercelFramework(framework: string): string {
  const frameworkMap: Record<string, string> = {
    'nextjs': 'nextjs',
    'react': 'create-react-app',
    'vue': 'vue',
    'vanilla': 'vanilla',
    'node': 'nodejs',
    'static': 'vanilla',
  };
  
  return frameworkMap[framework] || 'vanilla';
}

function getBuildCommand(framework: string): string {
  const buildCommands: Record<string, string> = {
    'nextjs': 'npm run build',
    'react': 'npm run build',
    'vue': 'npm run build',
    'node': 'npm run build',
    'vanilla': '',
    'static': '',
  };
  
  return buildCommands[framework] || '';
}

function getOutputDirectory(framework: string): string {
  const outputDirs: Record<string, string> = {
    'nextjs': '.next',
    'react': 'build',
    'vue': 'dist',
    'node': '',
    'vanilla': '',
    'static': '',
  };
  
  return outputDirs[framework] || '';
}