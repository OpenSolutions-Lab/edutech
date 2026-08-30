"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle,
  Building2,
  TrendingUp,
  Info,
  Map as MapIcon,
  List,
  Columns,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import { getSaldoOfertaDemanda, UnidadeSaldoData } from "@/actions/saldo-oferta-demanda";

const BaseMap = dynamic(() => import("@/components/maps/base-map").then((mod) => mod.BaseMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[450px] animate-pulse bg-muted/10 rounded-2xl flex items-center justify-center border border-border">
      <span className="text-xs text-muted-foreground">Carregando mapa cartográfico Mapbox...</span>
    </div>
  ),
});

const CrecheClusters = dynamic(() => import("@/components/maps/creche-clusters").then((mod) => mod.CrecheClusters), {
  ssr: false,
});

export function MapaOfertaDemandaFeature() {
  const [unidades, setUnidades] = useState<UnidadeSaldoData[]>([]);
  const [kpis, setKpis] = useState({
    totalVagasOciosas: 0,
    totalFilaEspera: 0,
    totalConfirmados: 0,
    unidadesComVagasOciosas: 0,
    unidadesComFilaCritica: 0,
    taxaPressaoMediaPct: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCre, setSelectedCre] = useState<string>("TODAS");
  const [selectedAno, setSelectedAno] = useState<number>(2025);
  const [searchBairro, setSearchBairro] = useState<string>("");
  const [unidadeDetalhe, setUnidadeDetalhe] = useState<UnidadeSaldoData | null>(null);

  // Alternador de modo de exibição: 'map' | 'split' | 'list'
  const [viewMode, setViewMode] = useState<"map" | "split" | "list">("split");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getSaldoOfertaDemanda({
        cre: selectedCre === "TODAS" ? undefined : selectedCre,
        bairro: searchBairro || undefined,
        ano: selectedAno,
      });
      setUnidades(res.unidades);
      setKpis(res.kpis);
      if (res.unidades.length > 0) {
        setUnidadeDetalhe((prev) => {
          if (!prev) return res.unidades[0];
          const exists = res.unidades.some((u) => u.id === prev.id);
          return exists ? prev : res.unidades[0];
        });
      } else {
        setUnidadeDetalhe(null);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedCre, selectedAno, searchBairro]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Mapa de Oferta × Demanda (Creches & EDIs)
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualização georreferenciada em mapa Mapbox de vagas ociosas vs. filas de espera por unidade e CRE.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador de Modo de Exibição */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              size="sm"
              variant={viewMode === "split" ? "default" : "ghost"}
              className="h-7 text-xs px-2.5 flex items-center gap-1.5"
              onClick={() => setViewMode("split")}
              title="Modo Dividido (Mapa + Lista)"
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dividido</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "map" ? "default" : "ghost"}
              className="h-7 text-xs px-2.5 flex items-center gap-1.5"
              onClick={() => setViewMode("map")}
              title="Apenas Mapa Mapbox"
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mapa Mapbox</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="h-7 text-xs px-2.5 flex items-center gap-1.5"
              onClick={() => setViewMode("list")}
              title="Apenas Lista de Unidades"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>

          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            Processo {selectedAno}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            {unidades.length} Creches & EDIs
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vagas Ociosas Identificadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {kpis.totalVagasOciosas.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponíveis para realocação rápida
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fila de Espera Ativa
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {kpis.totalFilaEspera.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Crianças (0-3a) em lista de preferência
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pressão Média da Rede
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {kpis.taxaPressaoMediaPct}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Índice de ocupação vs demanda
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unidades em Alerta Crítico
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">
              {kpis.unidadesComFilaCritica}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fila excedendo a capacidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card className="border-border/60 bg-card/40 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Filtrar por CRE:</span>
            <select
              value={selectedCre}
              onChange={(e) => setSelectedCre(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="TODAS">Todas as CREs (1ª a 11ª)</option>
              <option value="01ª CRE">01ª CRE (Centro/Santa Teresa)</option>
              <option value="02ª CRE">02ª CRE (Zona Sul/Tijuca)</option>
              <option value="03ª CRE">03ª CRE (Engenho Novo/Méier)</option>
              <option value="04ª CRE">04ª CRE (Bonsucesso/Maré/Ramos)</option>
              <option value="05ª CRE">05ª CRE (Madureira/CASCADURA)</option>
              <option value="06ª CRE">06ª CRE (Irajá/Pavuna)</option>
              <option value="07ª CRE">07ª CRE (Jacarepaguá/Anil/CDD)</option>
              <option value="08ª CRE">08ª CRE (Bangu/Realengo)</option>
              <option value="09ª CRE">09ª CRE (Campo Grande)</option>
              <option value="10ª CRE">10ª CRE (Santa Cruz/Guaratiba)</option>
              <option value="11ª CRE">11ª CRE (Ilha do Governador)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Ano do Processo:</span>
            <div className="flex gap-1">
              {[2021, 2022, 2023, 2024, 2025].map((ano) => (
                <Button
                  key={ano}
                  size="sm"
                  variant={selectedAno === ano ? "default" : "outline"}
                  className="h-8 text-xs px-2.5"
                  onClick={() => setSelectedAno(ano)}
                >
                  {ano}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por bairro ou nome (ex: Anil, Maré, Clarice)..."
                value={searchBairro}
                onChange={(e) => setSearchBairro(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* View Mode Layouts */}

      {/* 1. MAP ONLY MODE */}
      {viewMode === "map" && (
        <div className="h-[650px] w-full rounded-2xl overflow-hidden relative border border-border">
          <BaseMap>
            <CrecheClusters
              unidades={unidades}
              selectedUnidadeId={unidadeDetalhe?.id}
              onSelectUnidade={(u) => setUnidadeDetalhe(u)}
            />
          </BaseMap>
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg text-xs space-y-2 max-w-xs">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Legenda do Mapa (Creches & EDIs)
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-muted-foreground">Vagas Ociosas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                <span className="text-muted-foreground">Fila Crítica</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                <span className="text-muted-foreground">Pressão Alta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-muted-foreground">Equilibrado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SPLIT MODE (MAP + LIST + DETAIL) */}
      {viewMode === "split" && (
        <div className="grid gap-6 lg:grid-cols-12 min-h-[650px]">
          {/* Mapbox Canvas */}
          <div className="lg:col-span-7 h-[650px] rounded-2xl overflow-hidden relative border border-border shadow-md">
            <BaseMap>
              <CrecheClusters
                unidades={unidades}
                selectedUnidadeId={unidadeDetalhe?.id}
                onSelectUnidade={(u) => setUnidadeDetalhe(u)}
              />
            </BaseMap>
            {/* Floating Legend */}
            <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-md border border-border p-2.5 rounded-xl text-[11px] space-y-1.5">
              <span className="font-semibold text-foreground block text-[10px] uppercase">
                Status no Mapa Mapbox:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Libres
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Crítico
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Alta
                </span>
              </div>
            </div>
          </div>

          {/* List & Selected Detail Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-4 max-h-[650px] overflow-y-auto pr-1">
            {/* Unidade Detalhe Card */}
            {unidadeDetalhe && (
              <Card className="border-border/60 bg-card/80 backdrop-blur-sm shrink-0">
                <CardHeader className="border-b border-border/40 pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {unidadeDetalhe.cre}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Cód. {unidadeDetalhe.id}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-1 line-clamp-1">
                    {unidadeDetalhe.designacao}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Bairro {unidadeDetalhe.bairro}
                  </p>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-medium uppercase text-emerald-400 block">
                        Vagas Ociosas
                      </span>
                      <div className="text-lg font-bold text-emerald-400">
                        {unidadeDetalhe.vagasOciosas}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-medium uppercase text-amber-400 block">
                        Fila de Espera
                      </span>
                      <div className="text-lg font-bold text-amber-400">
                        {unidadeDetalhe.filaTotal}
                      </div>
                    </div>
                  </div>

                  {/* Prescriptive Insight */}
                  <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 text-xs space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      Diagnóstico Territorial
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-snug">
                      {unidadeDetalhe.statusDemanda === "CRITICO"
                        ? `Alta retenção no bairro ${unidadeDetalhe.bairro}. Recomenda-se acionar reclassificação por CPF.`
                        : unidadeDetalhe.statusDemanda === "EXCEDENTE_VAGAS"
                        ? `Possui ${unidadeDetalhe.vagasOciosas} vagas livres. Recomenda-se convocação de bairros limítrofes.`
                        : `Capacidade em equilíbrio operacional com fila normal.`}
                    </p>
                  </div>

                  <Link
                    href={`/escola/${unidadeDetalhe.id}`}
                    className="w-full h-8 text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                  >
                    <span>Ver Ficha Completa da Unidade</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Listagem Simplificada para navegação no Mapa */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Unidades na Área ({unidades.length})</span>
                <span className="text-[10px] normal-case text-primary font-normal">
                  Clique para focar no mapa
                </span>
              </h3>

              {loading ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  Carregando creches...
                </div>
              ) : (
                <div className="space-y-2">
                  {unidades.map((u) => {
                    const isSelected = unidadeDetalhe?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setUnidadeDetalhe(u)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-primary/10 border-primary ring-1 ring-primary"
                            : "bg-card/40 border-border/60 hover:border-primary/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-primary uppercase">
                              {u.cre}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {u.bairro}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {u.designacao}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                            {u.vagasOciosas} livres
                          </span>
                          <span className="text-[11px] text-amber-400 font-mono font-semibold">
                            {u.filaTotal} fila
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. LIST ONLY MODE */}
      {viewMode === "list" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Unidades Cards / List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Unidades Escolares de Educação Infantil ({unidades.length})
            </h2>

            {loading ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                Carregando geodados da rede de creches...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 max-h-[650px] overflow-y-auto pr-1">
                {unidades.map((u) => {
                  const isSelected = unidadeDetalhe?.id === u.id;
                  return (
                    <Card
                      key={u.id}
                      onClick={() => setUnidadeDetalhe(u)}
                      className={`cursor-pointer transition-all duration-200 border-border/60 hover:border-primary/50 ${
                        isSelected ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card/40"
                      }`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                              {u.cre} • {u.tipo}
                            </span>
                            <h3 className="text-sm font-bold text-foreground line-clamp-1">
                              {u.designacao}
                            </h3>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              u.statusDemanda === "CRITICO"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : u.statusDemanda === "EXCEDENTE_VAGAS"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }
                          >
                            {u.statusDemanda === "CRITICO"
                              ? "Fila Crítica"
                              : u.statusDemanda === "EXCEDENTE_VAGAS"
                              ? "Vagas Ociosas"
                              : "Pressão Alta"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>{u.bairro}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-semibold">
                              {u.vagasOciosas} ociosas
                            </span>
                            <span className="text-amber-400 font-semibold">
                              {u.filaTotal} fila
                            </span>
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] px-2 text-primary flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUnidadeDetalhe(u);
                              setViewMode("split");
                            }}
                          >
                            <MapIcon className="h-3 w-3" /> Focar no Mapa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Unit Details Panel */}
          <div>
            {unidadeDetalhe ? (
              <Card className="border-border/60 bg-card/60 sticky top-4">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {unidadeDetalhe.cre}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Cód. {unidadeDetalhe.id}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-2">
                    {unidadeDetalhe.designacao}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Bairro {unidadeDetalhe.bairro}
                  </p>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Pressure Indicator Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Índice de Pressão Territorial</span>
                      <span className="font-bold text-primary">
                        {(unidadeDetalhe.indicePressao * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          unidadeDetalhe.indicePressao > 0.8
                            ? "bg-rose-500"
                            : unidadeDetalhe.indicePressao > 0.5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(unidadeDetalhe.indicePressao * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-medium uppercase text-emerald-400">
                        Vagas Ociosas
                      </span>
                      <div className="text-xl font-bold text-emerald-400">
                        {unidadeDetalhe.vagasOciosas}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-medium uppercase text-amber-400">
                        Fila de Espera
                      </span>
                      <div className="text-xl font-bold text-amber-400">
                        {unidadeDetalhe.filaTotal}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] font-medium uppercase text-blue-400">
                        Capacidade Total
                      </span>
                      <div className="text-xl font-bold text-blue-400">
                        {unidadeDetalhe.vagasOferecidas}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-[10px] font-medium uppercase text-primary">
                        Matriculados
                      </span>
                      <div className="text-xl font-bold text-primary">
                        {unidadeDetalhe.confirmados}
                      </div>
                    </div>
                  </div>

                  {/* Prescriptive Insight */}
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs space-y-1.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" />
                      Diagnóstico Territorial
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {unidadeDetalhe.statusDemanda === "CRITICO"
                        ? `Unidade com alta retenção de inscrições duplicadas no bairro ${unidadeDetalhe.bairro}. Recomenda-se acionar a reclassificação por CPF para liberar vagas de preferência.`
                        : unidadeDetalhe.statusDemanda === "EXCEDENTE_VAGAS"
                        ? `Possui ${unidadeDetalhe.vagasOciosas} vagas livres. Recomenda-se a convocação direcionada de famílias dos bairros limítrofes.`
                        : `Capacidade em equilíbrio operacional com fila dentro da média territorial.`}
                    </p>
                  </div>

                  <Button
                    className="w-full text-xs font-semibold flex items-center justify-center gap-2"
                    onClick={() => setViewMode("split")}
                  >
                    <MapIcon className="h-4 w-4" />
                    Visualizar esta Unidade no Mapa
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
