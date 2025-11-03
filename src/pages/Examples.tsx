import { useState } from "react";
import {
  DSButton,
  DSCard,
  DSTabs,
  DSTabsList,
  DSTabsTrigger,
  DSTabsContent,
  DSTable,
  DSTableHeader,
  DSTableBody,
  DSTableHead,
  DSTableRow,
  DSTableCell,
  DSDataCard,
  DSAlert,
  DSAlertTitle,
  DSAlertDescription,
  DSInput,
  DSTextarea,
  DSSelect,
  DSSelectTrigger,
  DSSelectValue,
  DSSelectContent,
  DSSelectItem,
  DSCheckbox,
  DSSwitch,
  DSBadge,
  DSNavigation,
  DSNavItem,
  DSNavList,
  DSBreadcrumb,
  DSBreadcrumbList,
  DSBreadcrumbItem,
  DSBreadcrumbLink,
  DSBreadcrumbSeparator,
  DSBreadcrumbPage,
} from "@/components/design-system";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Home,
  Settings,
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export default function Examples() {
  const [checked, setChecked] = useState(false);
  const [switched, setSwitched] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Example */}
      <DSNavigation>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Dollyland
            </h1>
            <DSNavList>
              <li>
                <DSNavItem href="/" icon={Home} isActive>
                  Home
                </DSNavItem>
              </li>
              <li>
                <DSNavItem href="/design-system">Components</DSNavItem>
              </li>
              <li>
                <DSNavItem href="/examples">Examples</DSNavItem>
              </li>
            </DSNavList>
          </div>
          <div className="flex items-center gap-4">
            <DSButton variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </DSButton>
            <DSButton variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </DSButton>
          </div>
        </div>
      </DSNavigation>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb Example */}
        <DSBreadcrumb className="mb-8">
          <DSBreadcrumbList>
            <DSBreadcrumbItem>
              <DSBreadcrumbLink href="/">Home</DSBreadcrumbLink>
            </DSBreadcrumbItem>
            <DSBreadcrumbSeparator />
            <DSBreadcrumbItem>
              <DSBreadcrumbLink href="/examples">Examples</DSBreadcrumbLink>
            </DSBreadcrumbItem>
            <DSBreadcrumbSeparator />
            <DSBreadcrumbItem>
              <DSBreadcrumbPage>Dashboard</DSBreadcrumbPage>
            </DSBreadcrumbItem>
          </DSBreadcrumbList>
        </DSBreadcrumb>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Component Examples
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Real-world examples of Dollyland Design System components
        </p>

        {/* Alerts Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Alerts & Notifications</h2>
          <div className="space-y-4">
            <DSAlert variant="default" icon={Info}>
              <DSAlertTitle>Information</DSAlertTitle>
              <DSAlertDescription>
                This is an informational alert with glassmorphic styling and hover glow.
              </DSAlertDescription>
            </DSAlert>

            <DSAlert variant="success" icon={CheckCircle}>
              <DSAlertTitle>Success!</DSAlertTitle>
              <DSAlertDescription>
                Your changes have been saved successfully.
              </DSAlertDescription>
            </DSAlert>

            <DSAlert variant="warning" icon={AlertCircle}>
              <DSAlertTitle>Warning</DSAlertTitle>
              <DSAlertDescription>
                This action cannot be undone. Please proceed with caution.
              </DSAlertDescription>
            </DSAlert>

            <DSAlert variant="destructive" icon={AlertCircle}>
              <DSAlertTitle>Error</DSAlertTitle>
              <DSAlertDescription>
                An error occurred while processing your request.
              </DSAlertDescription>
            </DSAlert>
          </div>
        </section>

        {/* Dashboard Metrics Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Dashboard Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DSDataCard
              icon={Users}
              label="Total Users"
              value="12,543"
              change="+12.5%"
              changeType="positive"
            />
            <DSDataCard
              icon={DollarSign}
              label="Revenue"
              value="$48,291"
              change="+8.2%"
              changeType="positive"
            />
            <DSDataCard
              icon={TrendingUp}
              label="Growth"
              value="23.4%"
              change="-2.1%"
              changeType="negative"
            />
            <DSDataCard
              icon={Activity}
              label="Active Now"
              value="573"
              change="0%"
              changeType="neutral"
            />
          </div>
        </section>

        {/* Forms Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Form Components</h2>
          <DSCard className="p-8">
            <h3 className="text-2xl font-bold mb-6">Contact Form</h3>
            <div className="space-y-6">
              <DSInput label="Full Name" placeholder="John Doe" />
              <DSInput label="Email" type="email" placeholder="john@example.com" />
              
              <DSSelect>
                <DSSelectTrigger>
                  <DSSelectValue placeholder="Select a department" />
                </DSSelectTrigger>
                <DSSelectContent>
                  <DSSelectItem value="sales">Sales</DSSelectItem>
                  <DSSelectItem value="support">Support</DSSelectItem>
                  <DSSelectItem value="billing">Billing</DSSelectItem>
                </DSSelectContent>
              </DSSelect>

              <DSTextarea label="Message" placeholder="Tell us what's on your mind..." />

              <div className="flex items-center space-x-2">
                <DSCheckbox
                  id="terms"
                  checked={checked}
                  onCheckedChange={(value) => setChecked(value as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the terms and conditions
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <DSSwitch
                  id="newsletter"
                  checked={switched}
                  onCheckedChange={setSwitched}
                />
                <label htmlFor="newsletter" className="text-sm text-muted-foreground cursor-pointer">
                  Subscribe to newsletter
                </label>
              </div>

              <DSButton variant="gradient" className="w-full">
                Submit Form
              </DSButton>
            </div>
          </DSCard>
        </section>

        {/* Tabs Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Tabbed Content</h2>
          <DSTabs defaultValue="overview">
            <DSTabsList>
              <DSTabsTrigger value="overview">Overview</DSTabsTrigger>
              <DSTabsTrigger value="analytics">Analytics</DSTabsTrigger>
              <DSTabsTrigger value="reports">Reports</DSTabsTrigger>
              <DSTabsTrigger value="settings">Settings</DSTabsTrigger>
            </DSTabsList>
            <DSTabsContent value="overview">
              <DSCard className="p-8">
                <h3 className="text-2xl font-bold mb-4">Overview</h3>
                <p className="text-muted-foreground">
                  This is the overview tab with glassmorphic styling and smooth animations.
                </p>
              </DSCard>
            </DSTabsContent>
            <DSTabsContent value="analytics">
              <DSCard className="p-8">
                <h3 className="text-2xl font-bold mb-4">Analytics</h3>
                <p className="text-muted-foreground">
                  View your analytics and performance metrics here.
                </p>
              </DSCard>
            </DSTabsContent>
            <DSTabsContent value="reports">
              <DSCard className="p-8">
                <h3 className="text-2xl font-bold mb-4">Reports</h3>
                <p className="text-muted-foreground">
                  Generate and download detailed reports.
                </p>
              </DSCard>
            </DSTabsContent>
            <DSTabsContent value="settings">
              <DSCard className="p-8">
                <h3 className="text-2xl font-bold mb-4">Settings</h3>
                <p className="text-muted-foreground">
                  Configure your preferences and settings.
                </p>
              </DSCard>
            </DSTabsContent>
          </DSTabs>
        </section>

        {/* Table Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Data Table</h2>
          <DSTable>
            <DSTableHeader>
              <DSTableRow>
                <DSTableHead>Name</DSTableHead>
                <DSTableHead>Status</DSTableHead>
                <DSTableHead>Role</DSTableHead>
                <DSTableHead className="text-right">Amount</DSTableHead>
              </DSTableRow>
            </DSTableHeader>
            <DSTableBody>
              <DSTableRow>
                <DSTableCell className="font-medium">Alice Johnson</DSTableCell>
                <DSTableCell>
                  <DSBadge variant="gradient" gradient="from-emerald-500 to-teal-500">
                    Active
                  </DSBadge>
                </DSTableCell>
                <DSTableCell>Admin</DSTableCell>
                <DSTableCell className="text-right">$1,200.00</DSTableCell>
              </DSTableRow>
              <DSTableRow>
                <DSTableCell className="font-medium">Bob Smith</DSTableCell>
                <DSTableCell>
                  <DSBadge variant="gradient" gradient="from-blue-500 to-cyan-500">
                    Active
                  </DSBadge>
                </DSTableCell>
                <DSTableCell>Developer</DSTableCell>
                <DSTableCell className="text-right">$950.00</DSTableCell>
              </DSTableRow>
              <DSTableRow>
                <DSTableCell className="font-medium">Carol White</DSTableCell>
                <DSTableCell>
                  <DSBadge variant="outline">Pending</DSBadge>
                </DSTableCell>
                <DSTableCell>Designer</DSTableCell>
                <DSTableCell className="text-right">$800.00</DSTableCell>
              </DSTableRow>
              <DSTableRow>
                <DSTableCell className="font-medium">David Brown</DSTableCell>
                <DSTableCell>
                  <DSBadge variant="gradient" gradient="from-emerald-500 to-teal-500">
                    Active
                  </DSBadge>
                </DSTableCell>
                <DSTableCell>Manager</DSTableCell>
                <DSTableCell className="text-right">$1,500.00</DSTableCell>
              </DSTableRow>
            </DSTableBody>
          </DSTable>
        </section>

        {/* Buttons Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <DSButton variant="default">Default</DSButton>
            <DSButton variant="gradient">Gradient</DSButton>
            <DSButton variant="secondary">Secondary</DSButton>
            <DSButton variant="ghost">Ghost</DSButton>
            <DSButton variant="outline">Outline</DSButton>
            <DSButton variant="outline">Outline</DSButton>
          </div>
        </section>
      </div>
    </div>
  );
}
