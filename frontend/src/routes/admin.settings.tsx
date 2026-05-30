import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Info, Plug, Shield, Bell, Copy, RefreshCw, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const admins = [
  { name: "Alex Anderson", email: "alex@docuquery.io", role: "Super Admin", active: "Now", tint: "bg-primary/15 text-primary" },
  { name: "Jordan Miller", email: "jordan@docuquery.io", role: "Moderator", active: "2h ago", tint: "bg-gold/15 text-gold" },
];

const notifs = [
  { title: "System Critical Alerts", desc: "Instant alerts for server downtime or security breaches.", on: true },
  { title: "User Registration Updates", desc: "Daily digest of new user accounts and profile approvals.", on: false },
  { title: "Weekly Analytics Reports", desc: "Receive automated PDF summaries of platform growth.", on: true },
];

function AdminSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold">Admin Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure platform-wide parameters, security keys, and team permissions.</p>
      </div>

      <Section icon={Info} title="General" badge="Platform Info">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Platform Name" value="DocuQuery Enterprise" />
          <Field label="Support Email" value="ops@docuquery.io" />
        </div>
      </Section>

      <Section icon={Plug} title="Integration">
        <p className="text-sm text-muted-foreground">Manage access tokens for 3rd-party software connections and API calls.</p>
        <div className="mt-4">
          <Label className="text-sm font-medium">Production API Key</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2.5">
            <span className="flex-1 truncate font-mono text-sm text-muted-foreground">••••••••••••••••••••••••••••••</span>
            <button className="text-xs font-medium text-primary hover:underline">Show</button>
            <button className="text-muted-foreground hover:text-foreground"><Copy className="h-4 w-4" /></button>
            <button className="text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4" /></button>
          </div>
        </div>
      </Section>

      <Section icon={Shield} title="Admin Roles" action={<Button size="sm" variant="ghost" className="rounded-full text-primary"><Plus className="mr-1 h-3.5 w-3.5" /> Add Admin</Button>}>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-3 text-left">Administrator</th><th className="py-3 text-left">Role</th><th className="py-3 text-left">Last Active</th><th className="py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {admins.map((a, i) => (
              <motion.tr key={a.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className="border-t border-border">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${a.tint}`}>{a.name.split(" ").map(w => w[0]).join("")}</div>
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.tint}`}>{a.role}</span></td>
                <td className="py-4 text-muted-foreground">{a.active}</td>
                <td className="py-4 text-right"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section icon={Bell} title="Notification Settings">
        <ul className="divide-y divide-border">
          {notifs.map((n, i) => (
            <motion.li key={n.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className="flex items-center justify-between py-4">
              <div>
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <Switch defaultChecked={n.on} />
            </motion.li>
          ))}
        </ul>
      </Section>

      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-border bg-card/95 p-4 shadow-lift backdrop-blur">
        <span className="text-xs italic text-muted-foreground">Changes are only permanent after saving config.</span>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">Discard Changes</Button>
          <Button className="rounded-full px-5">Save Config</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, badge, action, children }: { icon: React.ComponentType<{ className?: string }>; title: string; badge?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        {badge && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{badge}</span>}
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input defaultValue={value} className="mt-1.5" />
    </div>
  );
}
