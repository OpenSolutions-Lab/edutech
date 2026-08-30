'use client';

import { useMemo } from 'react';
import {
  UnidadeRanqueada,
  ranquearUnidadesCreche,
  NUM_OPCOES,
  ANO_REFERENCIA,
  UNIDADES_CRECHE_SAMPLE,
} from '@/lib/engine/ranking-sugestao';
import { MapPin, Plus, Check, Trash2, ArrowLeft, ArrowRight, Sparkles, AlertCircle, Info } from 'lucide-react';
import type { CriancaData } from './inscricao-step1-crianca';
import type { CriterioData } from './inscricao-step2-criterio';

interface Step3Props {
  crianca: CriancaData;
  criterio: CriterioData;
  listaEscolhas: string[];
  setListaEscolhas: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: () => void;
  onNext: () => void;
}

export function InscricaoStep3Sugestoes({
  crianca,
  criterio,
  listaEscolhas,
  setListaEscolhas,
  onBack,
  onNext,
}: Step3Props) {
  const ranking = useMemo(() => {
    return ranquearUnidadesCreche(
      criterio.criterio,
      crianca.grupamento,
      criterio.ref
    );
  }, [criterio, crianca]);

  const handleAddOption = (codigo: string) => {
    if (!listaEscolhas.includes(codigo) && listaEscolhas.length < NUM_OPCOES) {
      setListaEscolhas([...listaEscolhas, codigo]);
    }
  };

  const handleRemoveOption = (codigo: string) => {
    setListaEscolhas(listaEscolhas.filter((c) => c !== codigo));
  };

  const handleRestoreTop5 = () => {
    const top5 = ranking.slice(0, NUM_OPCOES).map((r) => r.unidade.codigo);
    setListaEscolhas(top5);
  };

  const isCompleto = listaEscolhas.length === NUM_OPCOES;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">
            Grupamento: {crianca.grupamento}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
            Critério: {criterio.criterio === 'proximidade' ? 'Proximidade' : 'Agilidade de Alocação'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          3. Creches Sugeridas ({criterio.criterio === 'proximidade' ? 'mais próximas' : 'com menos concorrência'})
        </h2>
        {criterio.refRotulo && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            Referência: <strong>{criterio.refRotulo}</strong>
          </p>
        )}
      </div>

      {/* Banner de Aviso Legal sobre Dados Históricos */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <strong>Nota de Transparência ({ANO_REFERENCIA}):</strong> Vagas ofertadas e inscritos referem-se ao ano histórico anterior ({ANO_REFERENCIA}) e servem apenas como indicação para montagem da lista — não são garantia de vaga nem previsões do ano corrente.
        </div>
      </div>

      {/* Barra de Estado da Lista de Escolhas */}
      <div className="glass-card p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Minha Lista de Escolhas:</span>
            <span
              className={`font-mono text-sm font-bold ${
                isCompleto ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {listaEscolhas.length}/{NUM_OPCOES} opções selecionadas
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isCompleto
              ? '✓ Sua lista contém as 5 opções obrigatórias para envio.'
              : `Faltam ${NUM_OPCOES - listaEscolhas.length} opção(ões). Adicione mais creches da lista abaixo.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCompleto && (
            <button
              onClick={handleRestoreTop5}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold underline px-2 py-1"
            >
              Restaurar Top 5
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!isCompleto}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <span>Revisar e Reordenar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid: Lista de Cards de Creches Ranqueadas + Painel Lateral */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna Principal: Lista de Cards de Creches */}
        <div className="lg:col-span-2 space-y-4">
          {ranking.slice(0, 10).map((r, index) => {
            const u = r.unidade;
            const naLista = listaEscolhas.includes(u.codigo);
            const posicaoLista = listaEscolhas.indexOf(u.codigo) + 1;
            const cheio = listaEscolhas.length >= NUM_OPCOES;

            return (
              <div
                key={u.codigo}
                className={`glass-card p-5 rounded-2xl border transition-all space-y-3 ${
                  naLista
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : index === 0
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-border bg-card/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-primary font-mono">
                        #{index + 1} Sugestão
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                        {u.tipo} • CRE {u.cre}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{u.nome}</h3>
                    <p className="text-xs text-muted-foreground">{u.endereco}</p>
                  </div>

                  {naLista ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      {posicaoLista}ª opção
                    </span>
                  ) : null}
                </div>

                {/* Badges de Distância e Concorrência */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {r.distancia_km !== null && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                      📍 ~{r.distancia_km.toFixed(1)} km
                    </span>
                  )}
                  <span
                    className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-semibold"
                    style={{ backgroundColor: r.selo_concorrencia.cor }}
                  >
                    {r.selo_concorrencia.texto}
                  </span>
                </div>

                {/* Dados Históricos 2025 */}
                <div className="bg-muted/10 p-2.5 rounded-lg border border-border/40 text-xs text-muted-foreground">
                  📅 <strong>Histórico {ANO_REFERENCIA}:</strong> {r.vagas_ofertadas_ano_anterior} vagas ofertadas • {r.inscritos_ano_anterior} inscritos (~{r.candidatos_por_vaga.toFixed(1)} cand/vaga)
                </div>

                <p className="text-[11px] text-muted-foreground italic">{r.motivo}</p>

                {/* Ações */}
                <div className="pt-1 flex justify-end">
                  {naLista ? (
                    <button
                      onClick={() => handleRemoveOption(u.codigo)}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover da Minha Lista
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddOption(u.codigo)}
                      disabled={cheio}
                      className="flex items-center gap-1 text-xs text-primary-foreground font-semibold bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg shadow disabled:opacity-50 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar às Minhas Opções
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coluna Lateral: Resumo visual da Lista Selecionada */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-border space-y-4 sticky top-24">
            <h3 className="font-bold text-xs text-foreground uppercase tracking-wider border-b border-border pb-2">
              Opções Escolhidas ({listaEscolhas.length}/{NUM_OPCOES})
            </h3>

            {listaEscolhas.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nenhuma creche selecionada ainda. Clique em &quot;Adicionar às Minhas Opções&quot; nos cards ao lado.
              </p>
            ) : (
              <div className="space-y-2">
                {listaEscolhas.map((codigo, i) => {
                  const item = ranking.find((r) => r.unidade.codigo === codigo);
                  if (!item) return null;
                  return (
                    <div
                      key={codigo}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {item.unidade.nome}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveOption(codigo)}
                        className="text-muted-foreground hover:text-rose-400 p-1 shrink-0 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onNext}
                disabled={!isCompleto}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <span>Avançar para Lista de Escolhas ({listaEscolhas.length}/{NUM_OPCOES})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="pt-4 border-t border-border flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Critério
        </button>
      </div>
    </div>
  );
}
