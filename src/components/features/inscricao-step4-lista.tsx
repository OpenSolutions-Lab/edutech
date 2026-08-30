'use client';

import { useState } from 'react';
import {
  UNIDADES_CRECHE_SAMPLE,
  NUM_OPCOES,
  ANO_REFERENCIA,
  haversineKm,
} from '@/lib/engine/ranking-sugestao';
import { ListOrdered, ArrowUp, ArrowDown, Trash2, Plus, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CriterioData } from './inscricao-step2-criterio';

interface Step4Props {
  criterio: CriterioData;
  listaEscolhas: string[];
  setListaEscolhas: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: () => void;
  onSubmit: () => void;
}

export function InscricaoStep4Lista({
  criterio,
  listaEscolhas,
  setListaEscolhas,
  onBack,
  onSubmit,
}: Step4Props) {
  const [selectedAdicionar, setSelectedAdicionar] = useState('—');

  const moveItem = (index: number, delta: number) => {
    const newIdx = index + delta;
    if (newIdx < 0 || newIdx >= listaEscolhas.length) return;
    const list = [...listaEscolhas];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;
    setListaEscolhas(list);
  };

  const removeItem = (codigo: string) => {
    setListaEscolhas(listaEscolhas.filter((c) => c !== codigo));
  };

  const addItem = () => {
    if (selectedAdicionar !== '—' && !listaEscolhas.includes(selectedAdicionar) && listaEscolhas.length < NUM_OPCOES) {
      setListaEscolhas([...listaEscolhas, selectedAdicionar]);
      setSelectedAdicionar('—');
    }
  };

  const disponiveis = UNIDADES_CRECHE_SAMPLE.filter((u) => !listaEscolhas.includes(u.codigo)).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  const isCompleto = listaEscolhas.length === NUM_OPCOES;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-primary" />
          4. Minha Lista de Escolhas (Prioridade de 1ª a 5ª)
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A inscrição exige <strong>exatamente {NUM_OPCOES} opções de unidades</strong>, em ordem rigorosa de prioridade (a 1ª opção é a sua maior prioridade). Reordene com as setas (↑ ↓), remova com (✕) ou substitua por outras creches.
        </p>
      </div>

      {!isCompleto && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            Sua lista possui {listaEscolhas.length} de {NUM_OPCOES} opções. Adicione mais {NUM_OPCOES - listaEscolhas.length} para liberar o envio.
          </span>
        </div>
      )}

      {/* Lista Principal de Cards Reordenáveis */}
      <div className="space-y-3">
        {listaEscolhas.map((codigo, index) => {
          const u = UNIDADES_CRECHE_SAMPLE.find((item) => item.codigo === codigo);
          if (!u) return null;

          const dist = criterio.ref ? haversineKm(criterio.ref[0], criterio.ref[1], u.lat, u.lon) : null;

          return (
            <div
              key={u.codigo}
              className="glass-card p-4 rounded-2xl border border-border bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shrink-0 shadow-md">
                  {index + 1}ª
                </span>

                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                    {u.nome}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                      {u.tipo} • CRE {u.cre}
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{u.endereco}</p>
                  {dist !== null && (
                    <span className="inline-block text-[10px] text-blue-400 font-medium">
                      📍 ~{dist.toFixed(1)} km do endereço de referência
                    </span>
                  )}
                </div>
              </div>

              {/* Botões de Ação (Subir, Descer, Remover) */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  className="p-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  title="Subir prioridade"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={index === listaEscolhas.length - 1}
                  onClick={() => moveItem(index, 1)}
                  className="p-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  title="Descer prioridade"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(u.codigo)}
                  className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-all ml-1"
                  title="Remover da lista"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adicionar outra creche se faltarem escolhas */}
      {listaEscolhas.length < NUM_OPCOES && disponiveis.length > 0 && (
        <div className="glass-card p-4 rounded-2xl border border-border space-y-3">
          <label className="text-xs font-bold text-foreground block">Adicionar Outra Unidade Escolar</label>
          <div className="flex gap-2">
            <select
              value={selectedAdicionar}
              onChange={(e) => setSelectedAdicionar(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="—">— Selecione uma creche da rede —</option>
              {disponiveis.map((u) => (
                <option key={u.codigo} value={u.codigo}>
                  {u.nome} — {u.bairro} (CRE {u.cre})
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={selectedAdicionar === '—'}
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Botões do Rodapé */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às Sugestões
        </button>

        <button
          type="button"
          disabled={!isCompleto}
          onClick={onSubmit}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition-all"
        >
          <Send className="h-4 w-4" />
          <span>Enviar Inscrição Final</span>
        </button>
      </div>
    </div>
  );
}
