"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const pathLabels: Record<string, string> = {
  dashboard: "Painel Executivo",
  ia: "IA Preditiva",
  evasao: "Alerta de Evasão",
  rh: "Carência de RH",
  merenda: "Merenda Escolar",
  geo: "Geoprocessamento",
  mapa: "Mapa Interativo",
  vazios: "Vazios Educacionais",
  reformas: "Reformas Prediais",
  bi: "Business Intelligence",
  eficiencia: "Eficiência Orçamentária",
  vulnerabilidade: "Vulnerabilidade",
  fila: "Fila de Espera",
  escola: "Escola",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Navegação" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/dashboard"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = pathLabels[segment] || segment;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
