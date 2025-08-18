import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Invite {
  id: string;
  email: string;
  invite_code: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export const InviteManager = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
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
      // Generate invite code
      const { data: inviteCode, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError) throw codeError;

      // Create invite
      const { data: currentUser } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('invites')
        .insert({
          email: newEmail.toLowerCase().trim(),
          invite_code: inviteCode,
          created_by: currentUser?.user?.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("An invite for this email already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Invite created for ${newEmail}`);
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invite.email}</span>
                      {invite.used_at ? (
                        <Badge variant="secondary">Used</Badge>
                      ) : new Date(invite.expires_at) < new Date() ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Code: <code className="bg-muted px-1 rounded">{invite.invite_code}</code>
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