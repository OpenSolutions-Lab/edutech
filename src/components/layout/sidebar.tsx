"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Brain,
  GraduationCap,
  Users,
  UtensilsCrossed,
  Map,
  MapPin,
  Wrench,
  BarChart3,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  School,
  TrendingDown,
  Network,
  Layers,
  Send,
  Baby,
  UserCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group?: string;
}

const navItems: NavItem[] = [
  { label: "Painel Executivo", href: "/dashboard", icon: LayoutDashboard },
  // 🎯 Inscrição de Creche (Match Perfeito)
  { label: "Gestão de Fila (Fila Viva)", href: "/creche/gestao-fila", icon: UserCheck, group: "🎯 Match Perfeito & Creches" },
  { label: "Mapa Oferta × Demanda", href: "/creche/mapa", icon: MapPin, group: "🎯 Match Perfeito & Creches" },
  { label: "Motor CPF & Duplicidade", href: "/creche/duplicidade", icon: Layers, group: "🎯 Match Perfeito & Creches" },
  { label: "Demanda Futura (IBGE)", href: "/creche/demanda-futura", icon: Baby, group: "🎯 Match Perfeito & Creches" },
  { label: "Simulador de Convocação", href: "/creche/convocacao", icon: Send, group: "🎯 Match Perfeito & Creches" },
  // GenAI & Copilot Agêntico
  { label: "Copilot Agêntico Creche", href: "/copilot", icon: Brain, group: "✨ GenAI & Copilot" },
  { label: "Simulador What-If", href: "/simulador", icon: Network, group: "✨ GenAI & Copilot" },
  // Intersetorial
  { label: "Inteligência Intersetorial", href: "/intersetorial", icon: GraduationCap, group: "🌐 SME + SMDEIS DATA.RIO" },
  // BI & Relatórios
  { label: "Relatórios PDF Executivos", href: "/relatorios", icon: BarChart3, group: "📈 Business Intelligence" },
  { label: "Fila de Espera", href: "/bi/fila", icon: Clock, group: "📈 Business Intelligence" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";
  let currentGroup = "";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out shadow-xs",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo SME-Rio */}
      <div className="flex h-16 items-center border-b border-border px-3.5 overflow-hidden bg-sidebar">
        <Link href="/dashboard" className="flex items-center gap-3 w-full overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#00508A] p-1.5 shadow-md border border-cyan-400/20">
            <Image
              src={isLight ? "/images/sme-logo-color.png" : "/images/sme-logo-white.png"}
              alt="Secretaria Municipal de Educação - Rio de Janeiro"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-black uppercase tracking-wider text-foreground">
                EduTech Creche
              </span>
              <span className="truncate text-[10px] font-bold text-[#00508A] dark:text-cyan-400">
                SME — Prefeitura do Rio
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const showGroup = item.group && item.group !== currentGroup;
            if (item.group) currentGroup = item.group;

            return (
              <li key={item.href}>
                {showGroup && !collapsed && (
                  <div className="mb-2 mt-6 px-3 first:mt-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.group}
                    </span>
                  </div>
                )}
                {showGroup && collapsed && <div className="my-3 border-t border-border" />}
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && (
                    <div className="absolute left-0 h-6 w-[3px] rounded-r-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
