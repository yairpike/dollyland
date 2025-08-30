// Simple SEO meta tags without helmet
import { Header } from "@/components/Header";
import { PricingPlans } from "@/components/PricingPlans";

const Pricing = () => {
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