'use client';

import { useState } from 'react';
import { getGrupamentoPorNascimento } from '@/lib/engine/ranking-sugestao';
import { User, Calendar, ShieldCheck, ArrowRight, Baby } from 'lucide-react';

export interface CriancaData {
  nome: string;
  nascimento: string; // YYYY-MM-DD
  responsavel: string;
  modalidade: 'Pela internet (autônoma)' | 'Presencialmente numa unidade escolar';
  grupamento: string;
}

interface Step1Props {
  initialData: Partial<CriancaData>;
  onNext: (data: CriancaData) => void;
}

export function InscricaoStep1Crianca({ initialData, onNext }: Step1Props) {
  const [nome, setNome] = useState(initialData.nome || '');
  const [nascimento, setNascimento] = useState(initialData.nascimento || '2024-03-01');
  const [responsavel, setResponsavel] = useState(initialData.responsavel || '');
  const [modalidade, setModalidade] = useState<CriancaData['modalidade']>(
    initialData.modalidade || 'Pela internet (autônoma)'
  );
  const [error, setError] = useState('');

  const dateObj = new Date(nascimento + 'T12:00:00');
  const grupamento = getGrupamentoPorNascimento(isNaN(dateObj.getTime()) ? new Date(2024, 2, 1) : dateObj);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !responsavel.trim()) {
      setError('Por favor, preencha o nome da criança e o nome do responsável.');
      return;
    }
    setError('');
    onNext({
      nome: nome.trim(),
      nascimento,
      responsavel: responsavel.trim(),
      modalidade,
      grupamento,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Baby className="h-5 w-5 text-primary" />
          1. Identificação da Criança e do Responsável
        </h2>
        <p className="text-xs text-muted-foreground">
          Informe os dados básicos da criança para definirmos o grupamento escolar correspondente.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-border space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nome da Criança */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Nome Completo da Criança
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Lucas Silva Santos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Data de Nascimento
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              min="2021-01-01"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nome do Responsável */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Nome do Responsável Legal
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Maria da Silva Santos"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Modalidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Como está fazendo a inscrição?</label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="Pela internet (autônoma)">Pela internet (autônoma)</option>
              <option value="Presencialmente numa unidade escolar">Presencialmente numa unidade escolar</option>
            </select>
          </div>
        </div>

        {/* Badge do Grupamento Calculado */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Grupamento Atribuído (Março/2026)</span>
            <p className="text-base font-bold text-foreground">{grupamento}</p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/20 text-primary font-semibold">
            Definido por Idade
          </span>
        </div>

        {/* Botão Avançar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          >
            <span>Continuar para Critério de Sugestão</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
