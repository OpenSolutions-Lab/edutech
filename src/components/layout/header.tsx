"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00508A]/10 dark:bg-cyan-500/10 border border-[#00508A]/20 dark:border-cyan-500/20 text-xs font-extrabold text-[#00508A] dark:text-cyan-400 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#00C0F3] animate-pulse" />
          <span>Secretaria Municipal de Educação • Rio de Janeiro</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {/* Breadcrumb será injetado por cada página */}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Buscar escola"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={mounted && theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-red-400"
          title="Sair"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
