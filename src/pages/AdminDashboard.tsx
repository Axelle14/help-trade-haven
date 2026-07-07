import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Users, Package, Activity, ShieldCheck, TrendingUp, CheckCircle2,
  MoreHorizontal, Ban, UserCheck, Trash2, Flag, EyeOff, Eye, Search,
  Loader2, FileClock, ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  AdminOverview, AdminService, AdminUser, AppRole, AuditRow,
  deleteService, deleteUser, flagService, getOverview, listAudit,
  listServices, listUsers, newUsersMonthly, requestsByStatus,
  servicesByCategory, setServiceActive, setUserRole, setUserStatus,
} from "@/lib/admin";
import { Link } from "react-router-dom";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(150 70% 45%)",
  "hsl(45 95% 55%)",
  "hsl(25 95% 55%)",
  "hsl(280 70% 60%)",
  "hsl(200 80% 55%)",
  "hsl(340 75% 55%)",
];

function StatCard({
  label, value, icon: Icon, hint, tone,
}: { label: string; value: React.ReactNode; icon: any; hint?: string; tone?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={`rounded-full p-2.5 ${tone ?? "bg-primary/10 text-primary"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------- Overview -------------------------------- */
function OverviewTab() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; count: number }[]>([]);
  const [cats, setCats] = useState<{ category: string; count: number }[]>([]);
  const [statuses, setStatuses] = useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, m, c, s] = await Promise.all([
          getOverview(), newUsersMonthly(6), servicesByCategory(), requestsByStatus(),
        ]);
        setOverview(o); setMonthly(m); setCats(c); setStatuses(s);
      } catch (e: any) {
        toast({ title: "Failed to load overview", description: e.message, variant: "destructive" });
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="py-16 text-center"><Loader2 className="animate-spin inline" /></div>;
  if (!overview) return null;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={overview.total_users} icon={Users}
          hint={`${overview.active_users_30d} active in last 30d`} />
        <StatCard label="Total services" value={overview.total_services} icon={Package}
          hint={`${overview.active_services} active`} tone="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Active requests" value={overview.active_requests} icon={Activity}
          hint="Pending, accepted or in progress" tone="bg-amber-500/10 text-amber-500" />
        <StatCard label="Completed exchanges" value={overview.completed_exchanges} icon={CheckCircle2}
          hint="All-time" tone="bg-primary/10 text-primary" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" /> New users per month
          </h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" /> Services by category
          </h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 24 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {cats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-display font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" /> Service requests by status
          </h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statuses} dataKey="count" nameKey="status" outerRadius={90} label>
                  {statuses.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}

/* -------------------------------- Users ---------------------------------- */
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{ user: AdminUser; kind: "delete" | "suspend" | "activate" | "role"; role?: AppRole } | null>(null);
  const [reason, setReason] = useState("");

  const refresh = async (q?: string) => {
    setLoading(true);
    try { setUsers(await listUsers(q)); }
    catch (e: any) { toast({ title: "Failed to load users", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    suspended: users.filter(u => u.status === "suspended").length,
  }), [users]);

  const runAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete") await deleteUser(confirm.user.id, reason);
      else if (confirm.kind === "suspend") await setUserStatus(confirm.user.id, "suspended", reason);
      else if (confirm.kind === "activate") await setUserStatus(confirm.user.id, "active", reason);
      else if (confirm.kind === "role" && confirm.role) await setUserRole(confirm.user.id, confirm.role, reason);
      toast({ title: "Done" });
      setConfirm(null); setReason("");
      refresh(search);
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={stats.total} icon={Users} />
        <StatCard label="Active" value={stats.active} icon={UserCheck} tone="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Suspended" value={stats.suspended} icon={Ban} tone="bg-destructive/10 text-destructive" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search name or email…" className="pl-9"
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") refresh(search); }} />
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="animate-spin inline" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback>{(u.display_name ?? "?").slice(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="truncate font-medium">{u.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[220px]">{u.email}</TableCell>
                  <TableCell><Badge variant={u.role === "admin" ? "default" : u.role === "moderator" ? "secondary" : "outline"} className="capitalize">{u.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "suspended" ? "destructive" : "secondary"} className="capitalize">{u.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.status === "active" ? (
                          <DropdownMenuItem onClick={() => setConfirm({ user: u, kind: "suspend" })}>
                            <Ban className="w-4 h-4 mr-2" /> Suspend user
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setConfirm({ user: u, kind: "activate" })}>
                            <UserCheck className="w-4 h-4 mr-2" /> Activate user
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {(["user","moderator","admin"] as AppRole[]).filter(r => r !== u.role).map(r => (
                          <DropdownMenuItem key={r} onClick={() => setConfirm({ user: u, kind: "role", role: r })}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> Make {r}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirm({ user: u, kind: "delete" })}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!confirm} onOpenChange={o => { if (!o) { setConfirm(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === "delete" && "Delete user permanently"}
              {confirm?.kind === "suspend" && "Suspend user"}
              {confirm?.kind === "activate" && "Reactivate user"}
              {confirm?.kind === "role" && `Change role to ${confirm.role}`}
            </DialogTitle>
            <DialogDescription>
              {confirm?.user.display_name} ({confirm?.user.email})
              {confirm?.kind === "delete" && " — this cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason (recorded in audit log)" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setConfirm(null); setReason(""); }}>Cancel</Button>
            <Button variant={confirm?.kind === "delete" || confirm?.kind === "suspend" ? "destructive" : "default"} onClick={runAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------- Services -------------------------------- */
function ServicesTab() {
  const [items, setItems] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{ svc: AdminService; kind: "toggle" | "delete" | "flag" } | null>(null);
  const [reason, setReason] = useState("");

  const refresh = async (q?: string) => {
    setLoading(true);
    try { setItems(await listServices(q, null)); }
    catch (e: any) { toast({ title: "Failed to load services", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const runAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "toggle") await setServiceActive(confirm.svc.id, !confirm.svc.is_active, reason);
      else if (confirm.kind === "delete") await deleteService(confirm.svc.id, reason);
      else if (confirm.kind === "flag") {
        if (!reason.trim()) { toast({ title: "Reason required to flag", variant: "destructive" }); return; }
        await flagService(confirm.svc.id, reason);
      }
      toast({ title: "Done" });
      setConfirm(null); setReason("");
      refresh(search);
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search title, category or owner…" className="pl-9"
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") refresh(search); }} />
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="animate-spin inline" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium max-w-[260px] truncate">{s.title}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.category}</Badge></TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium truncate max-w-[160px]">{s.owner_name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{s.owner_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{s.point_price}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "secondary" : "outline"}>{s.is_active ? "Active" : "Hidden"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/explore?service=${s.id}`}><ExternalLink className="w-4 h-4 mr-2" /> View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirm({ svc: s, kind: "toggle" })}>
                          {s.is_active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {s.is_active ? "Remove (hide)" : "Restore"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirm({ svc: s, kind: "flag" })}>
                          <Flag className="w-4 h-4 mr-2" /> Flag service
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setConfirm({ svc: s, kind: "delete" })}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No services found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!confirm} onOpenChange={o => { if (!o) { setConfirm(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === "delete" && "Delete service permanently"}
              {confirm?.kind === "toggle" && (confirm.svc.is_active ? "Hide this service" : "Restore this service")}
              {confirm?.kind === "flag" && "Flag this service"}
            </DialogTitle>
            <DialogDescription>{confirm?.svc.title}</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason (recorded in audit log)" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setConfirm(null); setReason(""); }}>Cancel</Button>
            <Button variant={confirm?.kind === "delete" ? "destructive" : "default"} onClick={runAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------- Audit --------------------------------- */
function AuditTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setRows(await listAudit(200)); }
      catch (e: any) { toast({ title: "Failed to load audit log", description: e.message, variant: "destructive" }); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <Card>
      {loading ? (
        <div className="py-12 text-center"><Loader2 className="animate-spin inline" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">{r.admin_name ?? "—"}</TableCell>
                <TableCell><Badge variant="outline">{r.action}</Badge></TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="capitalize">{r.target_type}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[220px]">{r.target_label ?? r.target_id}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[280px] truncate">{r.reason ?? "—"}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No admin actions recorded yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

/* -------------------------------- Page ----------------------------------- */
export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <main className="container py-10 max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, services and monitor platform health.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/admin/moderation">Moderation</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/appeals">Appeals</Link></Button>
          </div>
        </header>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="audit"><FileClock className="w-4 h-4 mr-1.5" /> Audit log</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
          <TabsContent value="services" className="mt-6"><ServicesTab /></TabsContent>
          <TabsContent value="audit" className="mt-6"><AuditTab /></TabsContent>
        </Tabs>
      </main>
    </>
  );
}
