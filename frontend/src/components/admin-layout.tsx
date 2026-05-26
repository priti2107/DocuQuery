import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { adminNav } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return C ? <C className={className} /> : null;
}

export function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar p-5 lg:flex">
        <div>
          <Link to="/admin" className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Icons.Leaf className="h-4 w-4" />
            </div>
            <div>
              <div className="font-serif text-lg font-semibold text-primary">DocuQuery</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin Console</div>
            </div>
          </Link>
          <Button className="mb-6 w-full justify-center rounded-lg" variant="default">
            <Icons.Plus className="mr-1.5 h-4 w-4" /> New Report
          </Button>
          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  {active && (
                    <motion.span
                      layoutId="admin-sidebar-active"
                      className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                      transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
                    />
                  )}
                  <Icon name={item.icon} className={`relative h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`relative ${active ? "text-primary" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Admin User</div>
          <div>Super Admin</div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="relative w-full max-w-md">
            <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Global search..." className="h-9 rounded-full bg-muted/50 pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
              <Icons.Bell className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
              <Icons.Settings className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-clay to-primary" />
          </div>
        </header>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-8 py-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
