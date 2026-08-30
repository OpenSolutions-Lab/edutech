import Link from "next/link";
import {
  Brain,
  Map,
  BarChart3,
  ArrowRight,
  School,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
            <School className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">EduRio-Insights</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/transparencia"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Transparência
          </Link>
          <Link
            href="/mapa"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Mapa
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
          >
            Entrar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-8 pb-20 pt-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Plataforma de Inteligência Educacional
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Dados que{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              transformam
            </span>{" "}
            a educação carioca
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Combinamos inteligência artificial, análise geoespacial e dashboards
            dinâmicos para apoiar a tomada de decisão da Secretaria Municipal de
            Educação do Rio de Janeiro.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
            >
              Acessar Painel
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/transparencia"
              className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-card"
            >
              <Globe className="h-4 w-4" />
              Portal de Transparência
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-8 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {/* IA */}
            <div className="glass-card group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-violet-500/25">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                IA Preditiva
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Modelos de alerta precoce de evasão escolar, previsão de carência
                de professores e dimensionamento automático da merenda.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Score de risco por escola
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Projeção 3 meses de RH
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Ordens de compra automatizadas
                </li>
              </ul>
            </div>

            {/* Geo */}
            <div className="glass-card group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/25">
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                Geoprocessamento
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Mapas interativos com identificação de vazios educacionais,
                análise de rotas e priorização de reformas estruturais.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  1.500+ escolas mapeadas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Vazios por bairro e CRE
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Heatmaps de vulnerabilidade
                </li>
              </ul>
            </div>

            {/* BI */}
            <div className="glass-card group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-lg shadow-amber-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">
                Business Intelligence
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Painéis executivos com KPIs, ranking de vulnerabilidade escolar e
                transparência na fila de vagas por creche.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Custo por aluno por escola
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Índice de Vulnerabilidade
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Portal público de vagas
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-border bg-card/30 py-16">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-12 px-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">11</div>
              <div className="mt-1 text-sm text-muted-foreground">CREs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">1.500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Escolas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">650K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">160+</div>
              <div className="mt-1 text-sm text-muted-foreground">Bairros</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-8 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
            <span>© 2026 EduRio-Insights · Dados Abertos SME Rio</span>
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Dados públicos do DATA.RIO</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
