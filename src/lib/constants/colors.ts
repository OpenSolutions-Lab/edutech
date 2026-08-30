/**
 * Paleta de cores semânticas do EduRio-Insights
 */

export const RISK_COLORS = {
  baixo: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", hex: "#10B981" },
  moderado: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", hex: "#F59E0B" },
  alto: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", hex: "#F97316" },
  critico: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", hex: "#EF4444" },
} as const;

export const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#14B8A6", // teal
  "#A855F7", // purple
];

export const GRADIENT = {
  primary: "from-blue-600 to-cyan-500",
  secondary: "from-emerald-500 to-teal-400",
  accent: "from-amber-500 to-orange-400",
  danger: "from-red-500 to-rose-400",
  purple: "from-violet-600 to-purple-500",
};
