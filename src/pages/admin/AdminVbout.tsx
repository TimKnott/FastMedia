import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, Upload, Send, CheckCircle2, XCircle, Loader2, Users, BarChart3, Settings } from "lucide-react";

async function vboutAction(action: string, params: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke("vbout-proxy", {
    body: { action, ...params },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

// ─── Contacts Tab ────────────────────────────────────────────────────────────

function ContactsTab() {
  const [selectedList, setSelectedList] = useState<string>("");
  const queryClient = useQueryClient();

  const listsQuery = useQuery({
    queryKey: ["vbout-lists"],
    queryFn: () => vboutAction("get-lists"),
  });

  const contactsQuery = useQuery({
    queryKey: ["vbout-contacts", selectedList],
    queryFn: () => vboutAction("get-contacts", { listId: selectedList }),
    enabled: !!selectedList,
  });

  const syncSubscribers = useMutation({
    mutationFn: () => vboutAction("sync-subscribers", { listId: selectedList }),
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced} subscribers${data.errors ? `, ${data.errors} errors` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["vbout-contacts"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const syncLeads = useMutation({
    mutationFn: () => vboutAction("sync-leads", { listId: selectedList }),
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced} leads${data.errors ? `, ${data.errors} errors` : ""}`);
      queryClient.invalidateQueries({ queryKey: ["vbout-contacts"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const lists = listsQuery.data?.data?.lists?.items ?? listsQuery.data?.data?.items ?? [];
  const contacts = contactsQuery.data?.data?.contacts?.items ?? contactsQuery.data?.data?.items ?? [];
  const isSyncing = syncSubscribers.isPending || syncLeads.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select List</CardTitle>
          <CardDescription>Choose a Vbout email list to view or sync contacts to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder={listsQuery.isLoading ? "Loading lists…" : "Select a list"} />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list: { id: string; name: string }) => (
                <SelectItem key={list.id} value={String(list.id)}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedList && (
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => syncSubscribers.mutate()} disabled={isSyncing} size="sm">
                {syncSubscribers.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Sync Subscribers
              </Button>
              <Button onClick={() => syncLeads.mutate()} disabled={isSyncing} size="sm" variant="secondary">
                {syncLeads.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Sync Leads
              </Button>
              <Button onClick={() => contactsQuery.refetch()} disabled={contactsQuery.isFetching} size="sm" variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${contactsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedList && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contacts in List</CardTitle>
            <CardDescription>{contacts.length} contact(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {contactsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading contacts…
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-muted-foreground py-4">No contacts in this list yet.</p>
            ) : (
              <div className="overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.slice(0, 100).map((c: { id: string; email: string; status?: string }) => (
                      <TableRow key={c.id ?? c.email}>
                        <TableCell className="font-mono text-sm">{c.email}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "active" ? "default" : "secondary"}>
                            {c.status ?? "unknown"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Campaigns Tab ───────────────────────────────────────────────────────────

function CampaignsTab() {
  const campaignsQuery = useQuery({
    queryKey: ["vbout-campaigns"],
    queryFn: () => vboutAction("get-campaigns"),
  });

  const sendCampaign = useMutation({
    mutationFn: (campaignId: string) => vboutAction("send-campaign", { campaignId }),
    onSuccess: () => toast.success("Campaign sent successfully!"),
    onError: (e) => toast.error(e.message),
  });

  const campaigns = campaignsQuery.data?.data?.campaigns?.items ?? campaignsQuery.data?.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email Campaigns</CardTitle>
        <CardDescription>View and manage your Vbout email campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        {campaignsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-muted-foreground py-4">No campaigns found.</p>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                  <TableHead className="text-right">Clicked</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c: { id: string; name?: string; subject?: string; status?: string; statistics?: { sent?: number; opened?: number; clicked?: number } }) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name ?? c.subject ?? "Untitled"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "sent" ? "default" : "secondary"}>
                        {c.status ?? "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{c.statistics?.sent ?? "–"}</TableCell>
                    <TableCell className="text-right">{c.statistics?.opened ?? "–"}</TableCell>
                    <TableCell className="text-right">{c.statistics?.clicked ?? "–"}</TableCell>
                    <TableCell>
                      {c.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendCampaign.mutate(c.id)}
                          disabled={sendCampaign.isPending}
                        >
                          <Send className="mr-1 h-3 w-3" /> Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  const connectionQuery = useQuery({
    queryKey: ["vbout-connection"],
    queryFn: () => vboutAction("get-lists"),
  });

  const isConnected = !connectionQuery.isError && !!connectionQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connection Status</CardTitle>
        <CardDescription>Verify your Vbout API connection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking connection…
          </div>
        ) : isConnected ? (
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Connected to Vbout</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Connection failed</span>
            <span className="text-sm text-muted-foreground ml-2">
              {connectionQuery.error?.message}
            </span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => connectionQuery.refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${connectionQuery.isFetching ? "animate-spin" : ""}`} />
          Test Connection
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const AdminVbout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Vbout</h1>
        <p className="text-muted-foreground">Manage contacts, sync subscribers & leads, and view campaigns.</p>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-4 w-4" /> Contacts
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <ContactsTab />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVbout;
