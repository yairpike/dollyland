import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { PredictiveAnalytics } from "@/components/PredictiveAnalytics";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CommunityFeaturesTour } from "@/components/tours/CommunityFeaturesTour";
import { PredictiveAnalyticsTour } from "@/components/tours/PredictiveAnalyticsTour";
import { Users, TrendingUp } from "lucide-react";

export const Community = () => {
  const [isCommunityTourOpen, setIsCommunityTourOpen] = useState(false);
  const [isAnalyticsTourOpen, setIsAnalyticsTourOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Community</h1>
            <p className="text-muted-foreground">Connect, collaborate, and share with the AI agent community.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCommunityTourOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Community Tour
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAnalyticsTourOpen(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics Tour
            </Button>
          </div>
        </div>

        {/* Community Features */}
        <div className="space-y-6">
          <CommunityFeatures />
          <PredictiveAnalytics />
        </div>

        {/* Tours */}
        <CommunityFeaturesTour 
          isOpen={isCommunityTourOpen} 
          onClose={() => setIsCommunityTourOpen(false)} 
        />
        <PredictiveAnalyticsTour 
          isOpen={isAnalyticsTourOpen} 
          onClose={() => setIsAnalyticsTourOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
};