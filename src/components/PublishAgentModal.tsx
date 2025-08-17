import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Globe, DollarSign, Users, Star, X } from "lucide-react";

interface PublishAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
    category: string | null;
    tags: string[] | null;
  };
  onAgentUpdated: () => void;
}

const CATEGORIES = [
  { id: 'ui-ux', name: 'UI/UX Design' },
  { id: 'product', name: 'Product Design' },
  { id: 'frontend', name: 'Frontend Development' },
  { id: 'fullstack', name: 'Fullstack Development' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'copywriting', name: 'Copywriting' },
  { id: 'business', name: 'Business Strategy' },
  { id: 'analytics', name: 'Data Analytics' },
]

const PRICING_TIERS = [
  { id: 'free', name: 'Free', price: 0, description: 'Open for everyone to try' },
  { id: 'basic', name: 'Basic', price: 9.99, description: '1000 requests/month' },
  { id: 'pro', name: 'Pro', price: 29.99, description: '10,000 requests/month' },
  { id: 'enterprise', name: 'Enterprise', price: 99.99, description: 'Unlimited requests' },
]

export const PublishAgentModal = ({ open, onOpenChange, agent, onAgentUpdated }: PublishAgentModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    is_public: agent.is_public || false,
    category: agent.category || '',
    description: agent.description || '',
    tags: agent.tags?.join(', ') || '',
    pricing_tier: 'free',
    featured_description: '',
    use_cases: '',
  });

  const [tagList, setTagList] = useState<string[]>(agent.tags || []);

  const handleAddTag = (tag: string) => {
    if (tag && !tagList.includes(tag) && tagList.length < 8) {
      const newTags = [...tagList, tag];
      setTagList(newTags);
      setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tagList.filter(tag => tag !== tagToRemove);
    setTagList(newTags);
    setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          is_public: formData.is_public,
          category: formData.category,
          description: formData.description,
          tags: tagList.length > 0 ? tagList : null,
          // Add marketplace metadata
          // In production, you'd store pricing and other details in a separate table
        })
        .eq('id', agent.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Create initial analytics entry for publishing
      if (formData.is_public && !agent.is_public) {
        await supabase.from('agent_analytics').insert({
          agent_id: agent.id,
          user_id: user.id,
          event_type: 'published',
          metadata: {
            category: formData.category,
            pricing_tier: formData.pricing_tier,
            tags: tagList
          }
        });
      }

      toast.success(
        formData.is_public 
          ? "🎉 Agent published to marketplace!" 
          : "Agent removed from marketplace"
      );
      
      onAgentUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating agent:', error);
      toast.error("Failed to update agent");
    } finally {
      setLoading(false);
    }
  };

  const selectedPricing = PRICING_TIERS.find(tier => tier.id === formData.pricing_tier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {formData.is_public ? 'Publish to Marketplace' : 'Marketplace Settings'}
          </DialogTitle>
          <DialogDescription>
            {formData.is_public 
              ? 'Make your agent discoverable and monetize your expertise'
              : 'Configure how your agent appears in the marketplace'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label className="font-medium">Make Public</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to discover and use your agent
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_public: checked }))
              }
            />
          </div>

          {formData.is_public && (
            <>
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Marketplace Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what makes your agent special and what problems it solves..."
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This description will appear in the marketplace. Make it compelling!
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Skills & Technologies</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tagList.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add skills, technologies, or specialties (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      handleAddTag(target.value.trim());
                      target.value = '';
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Add up to 8 tags. Examples: React, Design Systems, User Research, API Development
                </p>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <Label>Pricing Tier</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRICING_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.pricing_tier === tier.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, pricing_tier: tier.id }))}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{tier.name}</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-sm">{tier.price === 0 ? 'Free' : tier.price}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Marketplace Preview
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <Badge variant="secondary">{selectedPricing?.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tagList.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {tagList.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{tagList.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (formData.is_public && (!formData.category || !formData.description))}
            >
              {loading ? "Saving..." : (formData.is_public ? "Publish Agent" : "Save Changes")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};