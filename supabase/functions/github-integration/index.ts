import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRepoRequest {
  name: string;
  description?: string;
  private?: boolean;
  agentId?: string;
  template?: 'react' | 'nextjs' | 'vanilla' | 'node';
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
}

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
      case 'create-repo':
        return await createRepository(req, user.id);
      case 'list-repos':
        return await listRepositories();
      case 'setup-project':
        return await setupProjectStructure(req, user.id);
      case 'commit-files':
        return await commitFiles(req, user.id);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('GitHub integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createRepository(req: Request, userId: string): Promise<Response> {
  const { name, description, private: isPrivate, agentId, template }: CreateRepoRequest = await req.json();

  if (!name) {
    throw new Error('Repository name is required');
  }

  // Create repository on GitHub
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description || `Repository created by AI Agent${agentId ? ` (Agent ID: ${agentId})` : ''}`,
      private: isPrivate ?? false,
      auto_init: true,
      gitignore_template: template === 'node' ? 'Node' : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const repo: GitHubRepo = await response.json();

  // Log the repository creation
  console.log(`Repository created: ${repo.full_name} for user ${userId}`);

  // If template is specified, set up basic project structure
  if (template) {
    await setupTemplateFiles(repo, template);
  }

  return new Response(JSON.stringify({
    success: true,
    repository: {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      defaultBranch: repo.default_branch,
    },
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listRepositories(): Promise<Response> {
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const repos: GitHubRepo[] = await response.json();

  return new Response(JSON.stringify({
    repositories: repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      defaultBranch: repo.default_branch,
    })),
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function setupTemplateFiles(repo: GitHubRepo, template: string): Promise<void> {
  const templates = {
    react: {
      'package.json': JSON.stringify({
        name: repo.name,
        version: '0.1.0',
        private: true,
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '5.0.1',
        },
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject',
        },
      }, null, 2),
      'src/App.js': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${repo.name}</h1>
        <p>This project was created by an AI Agent!</p>
      </header>
    </div>
  );
}

export default App;`,
      'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${repo.name}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    nextjs: {
      'package.json': JSON.stringify({
        name: repo.name,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          'next': 'latest',
          'react': '^18',
          'react-dom': '^18',
        },
      }, null, 2),
      'pages/index.js': `export default function Home() {
  return (
    <div>
      <h1>Welcome to ${repo.name}</h1>
      <p>This Next.js project was created by an AI Agent!</p>
    </div>
  );
}`,
      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`,
    },
    vanilla: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${repo.name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to ${repo.name}</h1>
    <p>This project was created by an AI Agent!</p>
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`,
      'script.js': `console.log('${repo.name} is ready!');`,
    },
    node: {
      'package.json': JSON.stringify({
        name: repo.name,
        version: '1.0.0',
        description: `Node.js project created by AI Agent`,
        main: 'index.js',
        scripts: {
          start: 'node index.js',
          dev: 'nodemon index.js',
        },
        dependencies: {
          express: '^4.18.0',
        },
        devDependencies: {
          nodemon: '^2.0.0',
        },
      }, null, 2),
      'index.js': `const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${repo.name}!',
    note: 'This API was created by an AI Agent!'
  });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`,
      'README.md': `# ${repo.name}

This Node.js project was created by an AI Agent.

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\``,
    },
  };

  const templateFiles = templates[template as keyof typeof templates];
  if (!templateFiles) return;

  // Create files one by one
  for (const [filePath, content] of Object.entries(templateFiles)) {
    await createFile(repo, filePath, content);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function createFile(repo: GitHubRepo, path: string, content: string): Promise<void> {
  const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add ${path}`,
      content: btoa(content), // Base64 encode content
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to create ${path}:`, error);
  }
}

async function setupProjectStructure(req: Request, userId: string): Promise<Response> {
  const { repoName, structure } = await req.json();
  
  // Implementation for setting up custom project structure
  // This would allow agents to create specific folder structures and files
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function commitFiles(req: Request, userId: string): Promise<Response> {
  const { repoName, files, commitMessage } = await req.json();
  
  // Implementation for committing multiple files at once
  // This would allow agents to push generated code to repositories
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}