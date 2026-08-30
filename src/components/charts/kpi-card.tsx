"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  School,
  GraduationCap,
  DollarSign,
  Users,
  MapPin,
  AlertTriangle,
  BarChart3,
  Clock,
  Shield,
  Brain,
  Map,
  Wrench,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  school: School,
  "graduation-cap": GraduationCap,
  "trending-down": TrendingDown,
  "dollar-sign": DollarSign,
  users: Users,
  "map-pin": MapPin,
  "alert-triangle": AlertTriangle,
  "bar-chart-3": BarChart3,
  clock: Clock,
  shield: Shield,
  brain: Brain,
  map: Map,
  wrench: Wrench,
  "utensils-crossed": UtensilsCrossed,
};

interface KPICardProps {
  titulo: string;
  valor: string;
  delta?: {
    value: string;
    isPositive: boolean;
    direction: "up" | "down" | "neutral";
  };
  iconName: string;
  gradiente?: string;
  className?: string;
}

export function KPICard({
  titulo,
  valor,
  delta,
  iconName,
  gradiente = "from-blue-600 to-cyan-500",
  className,
}: KPICardProps) {
  const Icone = iconMap[iconName] || School;
  const DeltaIcon =
    delta?.direction === "up"
      ? TrendingUp
      : delta?.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        className
      )}
    >
      {/* Gradient accent */}
      <div
        className={cn(
          "absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20",
          gradiente
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
            {valor}
          </p>
          {delta && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                delta.isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              <DeltaIcon className="h-3.5 w-3.5" />
              <span>{delta.value} vs. ano anterior</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
            gradiente
          )}
        >
          <Icone className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
