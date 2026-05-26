import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { userNav } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return C ? <C className={className} /> : null;
}

export function UserLayout() {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter out Profile since it goes into the Avatar dropdown
  const desktopNavItems = userNav.filter(item => item.label !== "Profile");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden mr-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Icons.Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <Icons.Sparkles className="h-4 w-4" />
                      </div>
                      <span className="font-serif text-xl font-semibold tracking-tight text-primary">DocuQuery</span>
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <nav className="flex flex-col gap-2">
                      {userNav.map((item) => {
                        const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Icon name={item.icon} className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                  <div className="p-4 border-t border-border">
                    <Button className="w-full rounded-full bg-primary text-primary-foreground">Upgrade Plan</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/dashboard" className="flex items-center gap-2 mr-8">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Icons.Sparkles className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">DocuQuery</span>
          </Link>
          
          <nav className="hidden items-center gap-1 lg:flex flex-1">
            {desktopNavItems.map((n) => {
              const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {active && (
                    <motion.span
                      layoutId="topnav-pill"
                      className="absolute inset-0 rounded-md bg-secondary"
                      transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 ${active ? "text-primary" : ""}`}>
                    {/* Optional icon in topnav: <Icon name={n.icon} className="h-4 w-4" /> */}
                    {n.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative hidden md:block">
              <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Quick Search..." className="h-9 w-56 lg:w-64 rounded-full bg-muted/50 pl-9" />
            </div>
            <Button variant="default" size="sm" className="hidden sm:inline-flex rounded-full px-5">Upgrade</Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-gradient-to-br from-sage to-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:opacity-90" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <Icons.User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center cursor-pointer">
                    <Icons.Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <Icons.LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 w-full mx-auto px-4 sm:px-6 py-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
