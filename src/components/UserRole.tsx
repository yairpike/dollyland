import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserRoleProps {
  className?: string;
}

export const UserRole = ({ className }: UserRoleProps) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { _user_id: user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default fallback
        } else {
          setRole(data || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading || !user || !role) {
    return null;
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'god':
        return {
          label: 'God',
          variant: 'default' as const,
          icon: Crown,
          className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold'
        };
      case 'gods_friends':
        return {
          label: "God's Friend",
          variant: 'secondary' as const,
          icon: Users,
          className: 'bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold'
        };
      default:
        return {
          label: 'User',
          variant: 'outline' as const,
          icon: User,
          className: ''
        };
    }
  };

  const roleDisplay = getRoleDisplay(role);
  const Icon = roleDisplay.icon;

  return (
    <Badge 
      variant={roleDisplay.variant} 
      className={`flex items-center gap-1 ${roleDisplay.className} ${className || ''}`}
    >
      <Icon className="w-3 h-3" />
      {roleDisplay.label}
    </Badge>
  );
};