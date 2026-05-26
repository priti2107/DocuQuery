import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Activity, Crown, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminUsers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

const stats = [
  { icon: Users, label: "Total Users", value: "12,842", delta: "+12% from last month", tint: "bg-primary/10 text-primary" },
  { icon: Activity, label: "Active Today", value: "1,402", delta: "+1k recently", tint: "bg-sage/15 text-primary" },
  { icon: Crown, label: "Pro Subscribers", value: "3,291", delta: "25.6% of total user base", tint: "bg-gold/15 text-gold" },
];

const roleTint: Record<string, string> = {
  Admin: "bg-primary/15 text-primary",
  Pro: "bg-gold/15 text-gold",
  Free: "bg-muted text-muted-foreground",
};

function AdminUsers() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="font-serif text-3xl font-semibold">{s.value}</div>
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-2 text-xs text-primary">↑ {s.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-serif text-xl font-semibold">User Directory</h2>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search users by name or email..." className="h-9 w-64 rounded-full" />
            <div className="inline-flex rounded-full border border-border p-0.5 text-xs">
              {["All", "Active", "Banned"].map((t, i) => (
                <button key={t} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="rounded-full">More Filters</Button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u, i) => (
              <motion.tr key={u.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t border-border transition hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sage to-primary" />
                    <div>
                      <div className={`font-medium ${u.status === "Banned" ? "line-through opacity-60" : ""}`}>{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.joined}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleTint[u.role]}`}>{u.role}</span></td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-primary" : "bg-destructive"}`} />
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.status === "Active" ? (
                      <>
                        {u.role === "Free" && <Button size="sm" variant="outline" className="rounded-full">Upgrade to Pro</Button>}
                        <button className="text-xs font-medium text-destructive hover:underline">Ban User</button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-full">Unban User</Button>
                    )}
                    <button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="font-serif text-lg font-semibold">Platform Integrity Notice</h3>
          <p className="mt-1 text-sm text-muted-foreground">Recent automated scans have flagged 34 accounts for suspicious document query patterns. Review the <a className="text-primary hover:underline" href="#">Integrity Report</a> to take action before the next billing cycle.</p>
        </div>
        <div className="surface-card p-5">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Recent Activity</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• <span className="font-medium">Admin</span> upgraded Elena Lopez to Pro</li>
            <li>• <span className="font-medium">System</span> banned David Black (Policy Violation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
