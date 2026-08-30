'use client';

import { useState } from 'react';
import { InscricaoStep1Crianca, type CriancaData } from './inscricao-step1-crianca';
import { InscricaoStep2Criterio, type CriterioData } from './inscricao-step2-criterio';
import { InscricaoStep3Sugestoes } from './inscricao-step3-sugestoes';
import { InscricaoStep4Lista } from './inscricao-step4-lista';
import { InscricaoStep5Confirmacao } from './inscricao-step5-confirmacao';
import { CheckCircle, Circle, RefreshCw, Sparkles, Building2, HelpCircle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'A criança' },
  { id: 2, title: 'Critério' },
  { id: 3, title: 'Sugestões' },
  { id: 4, title: 'Minha lista' },
  { id: 5, title: 'Envio' },
];

export function InscricaoSugestaoWizard() {
  const [etapa, setEtapa] = useState<number>(1);
  const [crianca, setCrianca] = useState<Partial<CriancaData>>({
    nome: '',
    nascimento: '2024-03-01',
    responsavel: '',
    modalidade: 'Pela internet (autônoma)',
  });

  const [criterio, setCriterio] = useState<Partial<CriterioData>>({
    criterio: 'proximidade',
    ref: null,
    refRotulo: '',
    motivoEndereco: 'Endereço próprio (onde a criança mora)',
  });

  const [listaEscolhas, setListaEscolhas] = useState<string[]>([]);

  const handleReset = () => {
    setEtapa(1);
    setCrianca({
      nome: '',
      nascimento: '2024-03-01',
      responsavel: '',
      modalidade: 'Pela internet (autônoma)',
    });
    setCriterio({
      criterio: 'proximidade',
      ref: null,
      refRotulo: '',
      motivoEndereco: 'Endereço próprio (onde a criança mora)',
    });
    setListaEscolhas([]);
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal de Título */}
      <div className="glass-card p-6 rounded-2xl border border-border bg-gradient-to-r from-blue-600/10 via-primary/5 to-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              Prefeitura do Rio • Educação
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              Protótipo Inteligente
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            Inscrição Creche — Sugestão de Alocação
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Auxílio à família na seleção das 5 opções prioritárias de creches com recomendação baseada em proximidade e concorrência histórica.
          </p>
        </div>

        {etapa > 1 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shrink-0 self-start md:self-center"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recomeçar Fluxo
          </button>
        )}
      </div>

      {/* Stepper de Progresso Visual */}
      <div className="glass-card p-4 rounded-2xl border border-border">
        <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto gap-2">
          {STEPS.map((s, idx) => {
            const isCompleted = s.id < etapa;
            const isCurrent = s.id === etapa;

            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-white shadow-md ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : s.id}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-foreground font-bold'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="h-0.5 w-6 sm:w-10 bg-border mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Dinâmico por Etapa */}
      <div className="pt-2">
        {etapa === 1 && (
          <InscricaoStep1Crianca
            initialData={crianca}
            onNext={(data) => {
              setCrianca(data);
              setEtapa(2);
            }}
          />
        )}

        {etapa === 2 && (
          <InscricaoStep2Criterio
            initialData={criterio}
            onBack={() => setEtapa(1)}
            onNext={(data) => {
              setCriterio(data);
              setEtapa(3);
            }}
          />
        )}

        {etapa === 3 && (
          <InscricaoStep3Sugestoes
            crianca={crianca as CriancaData}
            criterio={criterio as CriterioData}
            listaEscolhas={listaEscolhas}
            setListaEscolhas={setListaEscolhas}
            onBack={() => setEtapa(2)}
            onNext={() => setEtapa(4)}
          />
        )}

        {etapa === 4 && (
          <InscricaoStep4Lista
            criterio={criterio as CriterioData}
            listaEscolhas={listaEscolhas}
            setListaEscolhas={setListaEscolhas}
            onBack={() => setEtapa(3)}
            onSubmit={() => setEtapa(5)}
          />
        )}

        {etapa === 5 && (
          <InscricaoStep5Confirmacao
            crianca={crianca as CriancaData}
            criterio={criterio as CriterioData}
            listaEscolhas={listaEscolhas}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
