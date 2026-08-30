/**
 * Formatadores de dados para a interface pt-BR
 */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "short",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  // Assume valor já em forma decimal (0.05 = 5%)
  return percentFormatter.format(value);
}

export function formatPercentRaw(value: number): string {
  // Assume valor já em porcentagem (5 = 5%)
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatDelta(current: number, previous: number): {
  value: string;
  isPositive: boolean;
  direction: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return { value: "—", isPositive: true, direction: "neutral" };
  }
  const delta = ((current - previous) / previous) * 100;
  const isPositive = delta >= 0;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  return {
    value: `${isPositive ? "+" : ""}${delta.toFixed(1)}%`,
    isPositive,
    direction,
  };
}

export function formatRiskLevel(score: number): {
  label: string;
  color: string;
  level: "baixo" | "moderado" | "alto" | "critico";
} {
  if (score < 0.25) return { label: "Baixo", color: "text-green-500", level: "baixo" };
  if (score < 0.5) return { label: "Moderado", color: "text-yellow-500", level: "moderado" };
  if (score < 0.75) return { label: "Alto", color: "text-orange-500", level: "alto" };
  return { label: "Crítico", color: "text-red-500", level: "critico" };
}
