import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EduRio-Insights | Inteligência Educacional",
    template: "%s | EduRio-Insights",
  },
  description:
    "Plataforma omnicanal de inteligência educacional da SME do Rio de Janeiro. Modelos preditivos de IA, análise geoespacial e dashboards gerenciais dinâmicos.",
  keywords: [
    "educação",
    "Rio de Janeiro",
    "SME",
    "inteligência artificial",
    "dashboard",
    "dados abertos",
    "evasão escolar",
    "geoprocessamento",
  ],
  authors: [{ name: "EduRio-Insights" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "EduRio-Insights | Inteligência Educacional",
    description:
      "Plataforma de inteligência educacional da SME do Rio de Janeiro.",
    siteName: "EduRio-Insights",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
