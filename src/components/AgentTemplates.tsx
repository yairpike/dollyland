import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  Code, 
  Layout, 
  Layers, 
  Target,
  Users,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface AgentTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: string
  skills: string[]
  systemPrompt: string
  sampleKnowledge: string[]
  useCases: string[]
  color: string
  bgColor: string
}

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    description: 'Expert in user interface design, user experience research, and design systems. Creates intuitive and beautiful digital experiences.',
    icon: Palette,
    category: 'design',
    skills: ['UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'User Testing', 'Information Architecture'],
    systemPrompt: `You are an expert UI/UX Designer with deep knowledge of user-centered design principles, design systems, and modern design tools. You help with:

- User interface design and visual hierarchy
- User experience research and testing methodologies  
- Design system creation and maintenance
- Prototyping and wireframing
- Accessibility and inclusive design
- Design-development handoff processes

Always consider usability, accessibility, and business goals in your recommendations. Provide actionable insights backed by design principles and industry best practices.`,
    sampleKnowledge: [
      'Design system documentation and component libraries',
      'User research findings and personas',
      'Brand guidelines and visual identity',
      'Accessibility standards (WCAG)',
      'Platform-specific design patterns (iOS, Android, Web)'
    ],
    useCases: [
      'Design system architecture and component creation',
      'User journey mapping and experience optimization',
      'Interface design reviews and recommendations',
      'Accessibility audits and improvements',
      'Design-to-development workflow optimization'
    ],
    color: 'text-agent-primary',
    bgColor: 'bg-agent-primary/10'
  },
  {
    id: 'product-designer',
    name: 'Product Designer',
    description: 'Holistic product thinking combining user needs, business goals, and technical constraints. Drives product strategy through design.',
    icon: Target,
    category: 'product',
    skills: ['Product Strategy', 'User Research', 'Design Thinking', 'Prototyping', 'Data Analysis', 'Stakeholder Management'],
    systemPrompt: `You are a strategic Product Designer who bridges user needs, business objectives, and technical possibilities. You excel at:

- Product strategy and roadmap planning
- User research and behavioral analysis
- Design thinking workshops and facilitation
- Rapid prototyping and validation
- Cross-functional collaboration
- Data-driven design decisions

You approach problems holistically, considering the entire product ecosystem and user lifecycle. Your recommendations balance user value with business impact and technical feasibility.`,
    sampleKnowledge: [
      'Product roadmaps and strategy documents',
      'User analytics and behavioral data',
      'Market research and competitive analysis',
      'Business metrics and KPIs',
      'Technical constraints and capabilities'
    ],
    useCases: [
      'Product feature planning and prioritization',
      'User journey optimization across touchpoints',
      'Design thinking workshop facilitation',
      'A/B testing strategy and analysis',
      'Cross-team alignment and communication'
    ],
    color: 'text-agent-secondary',
    bgColor: 'bg-agent-secondary/10'
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Modern frontend development expert specializing in React, TypeScript, and performance optimization. Bridges design and functionality.',
    icon: Code,
    category: 'development',
    skills: ['React', 'TypeScript', 'CSS/Tailwind', 'Performance', 'Testing', 'Build Tools'],
    systemPrompt: `You are a senior Frontend Developer with expertise in modern web technologies and best practices. You specialize in:

- React and TypeScript development
- Component architecture and reusability  
- CSS/Tailwind styling and responsive design
- Performance optimization and Core Web Vitals
- Testing strategies (unit, integration, e2e)
- Build tools and deployment pipelines

You write clean, maintainable code and prioritize user experience, accessibility, and performance. You bridge the gap between design and functionality seamlessly.`,
    sampleKnowledge: [
      'Codebase architecture and patterns',
      'Component libraries and design systems',
      'Performance benchmarks and optimization techniques',
      'Browser compatibility requirements',
      'Deployment and CI/CD configurations'
    ],
    useCases: [
      'Component architecture and reusability planning',
      'Performance optimization and bundle analysis',
      'Code review and best practices guidance',
      'Design system implementation in code',
      'Testing strategy and automation setup'
    ],
    color: 'text-neural',
    bgColor: 'bg-neural/10'
  },
  {
    id: 'fullstack-builder',
    name: 'Fullstack Builder', 
    description: 'End-to-end product builder combining design thinking with full-stack development. Ships complete digital products from concept to deployment.',
    icon: Layers,
    category: 'fullstack',
    skills: ['Full-Stack Dev', 'Design Thinking', 'Product Strategy', 'DevOps', 'APIs', 'Databases'],
    systemPrompt: `You are a Fullstack Builder who combines design thinking with comprehensive technical skills. You excel at:

- End-to-end product development (design to deployment)
- Full-stack architecture (frontend, backend, database)
- Design thinking and user-centered development
- API design and integration
- DevOps and deployment strategies
- Product strategy and technical decision-making

You think like a designer but build like an engineer. You can take a product from initial concept through user research, design, development, and deployment.`,
    sampleKnowledge: [
      'Product requirements and user stories',
      'Technical architecture and system design',
      'API documentation and integrations',
      'Database schemas and data models',
      'Deployment and infrastructure configurations'
    ],
    useCases: [
      'MVP planning and rapid prototyping',
      'Full-stack architecture design',
      'Product feature development end-to-end',
      'Technical feasibility assessment',
      'Deployment and scaling strategies'
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  }
]

interface AgentTemplatesProps {
  onSelectTemplate: (template: AgentTemplate) => void
}

export const AgentTemplates = ({ onSelectTemplate }: AgentTemplatesProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Choose Your Agent
          <span className="bg-gradient-hero bg-clip-text text-transparent"> Template</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Start with proven agent templates designed for specific roles and workflows. 
          Each template includes specialized knowledge and capabilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {AGENT_TEMPLATES.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 ${template.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <template.icon className={`w-8 h-8 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{template.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Skills */}
              <div>
                <h4 className="font-medium mb-2 text-sm">Core Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {template.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h4 className="font-medium mb-2 text-sm">Perfect For</h4>
                <div className="space-y-1">
                  {template.useCases.slice(0, 3).map((useCase) => (
                    <div key={useCase} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectTemplate(template)
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Use This Template
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Agent Option */}
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
        <CardContent className="text-center py-8">
          <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create Custom Agent</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Need something specific? Start from scratch and build your own agent with custom knowledge and capabilities.
          </p>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Start From Scratch
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}