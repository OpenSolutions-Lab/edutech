'use client';

import { useMemo } from 'react';
import { UNIDADES_CRECHE_SAMPLE, ANO_REFERENCIA, haversineKm } from '@/lib/engine/ranking-sugestao';
import { CheckCircle2, FileText, Printer, RefreshCw, Calendar, User, ShieldCheck, MapPin, Award } from 'lucide-react';
import type { CriancaData } from './inscricao-step1-crianca';
import type { CriterioData } from './inscricao-step2-criterio';

interface Step5Props {
  crianca: CriancaData;
  criterio: CriterioData;
  listaEscolhas: string[];
  onReset: () => void;
}

export function InscricaoStep5Confirmacao({
  crianca,
  criterio,
  listaEscolhas,
  onReset,
}: Step5Props) {
  // Gerar protocolo com base na primeira unidade e nome da criança
  const protocolo = useMemo(() => {
    const primeira = UNIDADES_CRECHE_SAMPLE.find((u) => u.codigo === listaEscolhas[0]);
    const creNum = primeira ? primeira.cre : 2;
    let seed = 0;
    const key = crianca.nome + (primeira ? primeira.codigo : 'CRE');
    for (let i = 0; i < key.length; i++) {
      seed = (seed + key.charCodeAt(i) * (i + 1)) % 900000;
    }
    const numRandom = 100000 + seed;
    return `CRE${String(creNum).padStart(2, '0')}-2026-${numRandom}`;
  }, [crianca, listaEscolhas]);

  const unidadesEscolhas = useMemo(() => {
    return listaEscolhas
      .map((codigo) => UNIDADES_CRECHE_SAMPLE.find((u) => u.codigo === codigo))
      .filter((u): u is typeof UNIDADES_CRECHE_SAMPLE[0] => u !== undefined);
  }, [listaEscolhas]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Banner de Sucesso */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Inscrição Efetuada com Sucesso</span>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            Protocolo #{protocolo}
          </h2>
          <p className="text-xs text-muted-foreground">
            Guarde este número para acompanhamento no portal oficial matricula.rio.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-all shrink-0"
        >
          <Printer className="h-4 w-4" />
          Imprimir Comprovante
        </button>
      </div>

      {/* Resumo dos Dados Cadastrados */}
      <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Resumo da Inscrição
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <User className="h-3 w-3 text-primary" /> Nome da Criança
            </span>
            <p className="font-bold text-foreground">{crianca.nome}</p>
          </div>

          <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" /> Responsável Legal
            </span>
            <p className="font-bold text-foreground">{crianca.responsavel}</p>
          </div>

          <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" /> Grupamento Alocado (2026)
            </span>
            <p className="font-bold text-emerald-400">{crianca.grupamento}</p>
          </div>

          <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
            <span className="text-muted-foreground text-[10px] flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" /> Endereço de Referência
            </span>
            <p className="font-bold text-foreground">{criterio.refRotulo || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Relação Enviada das 5 Creches em Ordem de Prioridade */}
      <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          Opções Escolhidas (Por Ordem de Prioridade)
        </h3>

        <div className="space-y-2.5">
          {unidadesEscolhas.map((u, index) => {
            const dist = criterio.ref ? haversineKm(criterio.ref[0], criterio.ref[1], u.lat, u.lon) : null;

            return (
              <div
                key={u.codigo}
                className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-foreground">{u.nome}</h4>
                    <p className="text-[11px] text-muted-foreground">{u.tipo} • CRE {u.cre} • {u.bairro}</p>
                  </div>
                </div>

                {dist !== null && (
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                    📍 {dist.toFixed(1)} km
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações Finais */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Fazer Nova Inscrição
        </button>
      </div>
    </div>
  );
}
