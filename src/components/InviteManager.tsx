import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Invite {
  id: string;
  invite_code: string;
  email: string;
  status: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

interface InviteCreateResponse {
  id: string;
  invite_code: string;
  email: string;
  status: string;
}

export const InviteManager = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_invites_safe');

      if (error) throw error;
      
      console.log('Raw invite data:', data); // Debug log
      
      // Ensure data has email field, fallback to empty string if missing
      const invitesWithEmail = (data || []).map((invite: any) => {
        console.log('Processing invite:', invite); // Debug log
        return {
          ...invite,
          email: invite.email || 'No email'
        };
      });
      
      console.log('Processed invites:', invitesWithEmail); // Debug log
      setInvites(invitesWithEmail);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error("Failed to load invites");
    }
  };

  const createInvite = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Use secure function to create invite
      const { data, error } = await supabase
        .rpc('create_invite_with_email_secure', { 
          p_email: newEmail.toLowerCase().trim() 
        });

      if (error) {
        if (error.message?.includes('already exists')) {
          toast.error("An invite for this email already exists");
        } else if (error.message?.includes('Too many invites')) {
          toast.error("Rate limit exceeded. Please wait before creating more invites.");
        } else {
          throw error;
        }
        return;
      }

      const response = data as unknown as InviteCreateResponse;
      
      // If the invite was created successfully and needs email, send it
      if (response && response.invite_code) {
        try {
          await supabase.functions.invoke('send-invite-email', {
            body: {
              email: newEmail,
              inviteCode: response.invite_code,
              inviterName: user?.user_metadata?.full_name || 'Someone'
            }
          });
          toast.success(`Invite created and email sent to ${newEmail}`);
        } catch (emailError) {
          console.warn('Invite created but email failed to send:', emailError);
          toast.success(`Invite created for ${newEmail} (email sending failed - please share the code manually)`);
        }
      } else {
        toast.success(`Invite created for ${newEmail}`);
      }
      
      setNewEmail("");
      fetchInvites();
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error("Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Invite deleted");
      fetchInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error("Failed to delete invite");
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Invite Manager
        </CardTitle>
        <CardDescription>
          Manage invites for the closed alpha. Users need a valid invite code to sign up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Invite */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newEmail">Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createInvite()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createInvite} disabled={loading}>
              {loading ? "Creating..." : "Create Invite"}
            </Button>
          </div>
        </div>

        {/* Invites List */}
        <div className="space-y-3">
          <h3 className="font-medium">Active Invites ({invites.length})</h3>
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invites created yet.</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{invite.email}</span>
                      <Badge variant={
                        invite.status === 'Used' ? 'secondary' :
                        invite.status === 'Expired' ? 'destructive' :
                        'default'
                      }>
                        {invite.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Code: <code className="bg-muted px-1 rounded">{invite.invite_code}</code>
                      <span className="ml-2">• Created {new Date(invite.created_at).toLocaleDateString()}</span>
                      {invite.used_at && (
                        <span className="ml-2">• Used on {new Date(invite.used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteCode(invite.invite_code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!invite.used_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInvite(invite.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 <strong>How it works:</strong> Users need to enter both their email and the invite code during signup. 
          Invite codes expire after 30 days and can only be used once.
        </div>
      </CardContent>
    </Card>
  );
};