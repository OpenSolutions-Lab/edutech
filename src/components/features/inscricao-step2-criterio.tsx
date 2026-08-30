'use client';

import { useState } from 'react';
import { BAIRROS_RIO, centroideBairro } from '@/lib/engine/ranking-sugestao';
import { geocodificarEndereco } from '@/lib/geo/geocode-client';
import { MapPin, Compass, Search, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export interface CriterioData {
  criterio: 'proximidade' | 'agilidade';
  ref: [number, number] | null;
  refRotulo: string;
  motivoEndereco: string;
}

interface Step2Props {
  initialData: Partial<CriterioData>;
  onBack: () => void;
  onNext: (data: CriterioData) => void;
}

const MOTIVOS_ENDERECO = [
  'Endereço próprio (onde a criança mora)',
  'Endereço da rede de apoio (avós, familiar, vizinho que ajuda no dia a dia)',
  'Endereço de trabalho do responsável',
];

export function InscricaoStep2Criterio({ initialData, onBack, onNext }: Step2Props) {
  const [criterio, setCriterio] = useState<'proximidade' | 'agilidade'>(initialData.criterio || 'proximidade');
  const [enderecoInput, setEnderecoInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [bairroSelect, setBairroSelect] = useState('—');
  const [ref, setRef] = useState<[number, number] | null>(initialData.ref || null);
  const [refRotulo, setRefRotulo] = useState(initialData.refRotulo || '');
  const [motivoEndereco, setMotivoEndereco] = useState(initialData.motivoEndereco || MOTIVOS_ENDERECO[0]);
  const [searchWarning, setSearchWarning] = useState('');

  const handleGeocode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enderecoInput.trim()) return;

    setIsGeocoding(true);
    setSearchWarning('');
    const result = await geocodificarEndereco(enderecoInput);
    setIsGeocoding(false);

    if (result) {
      setRef([result.lat, result.lon]);
      setRefRotulo(result.rotulo);
    } else {
      setSearchWarning('Não foi possível localizar o endereço exato. Selecione o bairro abaixo para centralizar.');
    }
  };

  const handleSelectBairro = (bairro: string) => {
    setBairroSelect(bairro);
    if (bairro !== '—') {
      const coords = centroideBairro(bairro);
      if (coords) {
        setRef(coords);
        setRefRotulo(`Bairro: ${bairro}`);
        setSearchWarning('');
      }
    }
  };

  const handleAdvance = () => {
    onNext({
      criterio,
      ref,
      refRotulo,
      motivoEndereco,
    });
  };

  const canAdvance = criterio === 'agilidade' || ref !== null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          2. Como você quer que a gente sugira a creche?
        </h2>
        <p className="text-xs text-muted-foreground">
          Escolha a sua preferência de ordenação para personalizarmos as recomendações de creche.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border space-y-6">
        {/* Escolha do Critério */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCriterio('proximidade')}
            className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
              criterio === 'proximidade'
                ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                : 'border-border bg-card/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Proximidade
              </span>
              {criterio === 'proximidade' && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quero a creche mais perto do endereço que eu indicar (residência, trabalho ou rede de apoio).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCriterio('agilidade')}
            className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
              criterio === 'agilidade'
                ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                : 'border-border bg-card/30 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-500" /> Agilidade de Alocação
              </span>
              {criterio === 'agilidade' && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quero ser alocado o mais rápido possível, priorizando unidades com menor concorrência histórica em 2025.
            </p>
          </button>
        </div>

        <hr className="border-border" />

        {/* Formulário de Endereço se o critério for Proximidade */}
        {criterio === 'proximidade' ? (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Endereço de Referência</h3>
            
            <form onSubmit={handleGeocode} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex.: Rua Conde de Bonfim, 300, Tijuca"
                value={enderecoInput}
                onChange={(e) => setEnderecoInput(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={isGeocoding || !enderecoInput.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {isGeocoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Localizar
              </button>
            </form>

            {searchWarning && (
              <p className="text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-medium">
                {searchWarning}
              </p>
            )}

            {/* Ou escolha de Bairro */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ou escolha o bairro de referência:</label>
              <select
                value={bairroSelect}
                onChange={(e) => handleSelectBairro(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="—">— Selecione um bairro —</option>
                {BAIRROS_RIO.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Motivo do endereço */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-foreground">Qual é esse endereço?</label>
              <div className="space-y-2">
                {MOTIVOS_ENDERECO.map((motive) => (
                  <label
                    key={motive}
                    className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer bg-muted/10 hover:bg-muted/20 p-2.5 rounded-lg border border-border transition-colors"
                  >
                    <input
                      type="radio"
                      name="motivo"
                      checked={motivoEndereco === motive}
                      onChange={() => setMotivoEndereco(motive)}
                      className="text-primary focus:ring-primary"
                    />
                    <span>{motive}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback de endereço localizado */}
            {refRotulo && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Referência definida: <strong>{refRotulo}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground leading-relaxed space-y-2">
              <p className="font-semibold text-foreground">Sem endereço obrigatório.</p>
              <p>
                As creches serão ordenadas com base no histórico de concorrência do ano anterior (2025): quantos inscritos disputaram cada vaga oferecida no grupamento. Menos concorrência = indicação de alocação mais rápida.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Bairro (opcional para centralizar o mapa):</label>
              <select
                value={bairroSelect}
                onChange={(e) => handleSelectBairro(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="—">— Nenhum (Visão Geral do Rio) —</option>
                {BAIRROS_RIO.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            type="button"
            disabled={!canAdvance}
            onClick={handleAdvance}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <span>Ver Sugestões de Alocação</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
