import { Header } from "@/components/Header";
import { PricingPlans } from "@/components/PricingPlans";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";

const Pricing = () => {
  const { user } = useAuth();

  // If user is signed in, use dashboard layout
  if (user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PricingPlans />
        </div>
      </DashboardLayout>
    );
  }

  // For anonymous users, use the original layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <main>
        <PricingPlans />
      </main>
    </div>
  );
};

export default Pricing;