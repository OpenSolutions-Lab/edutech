'use client';

import React, { useState } from 'react';
import { PlanoAulaContextualizado } from '@/types/smdeis-intersetorial';
import { generateLessonPlanAction } from '@/actions/smdeis-demanda-socioeconomica';
import { Sparkles, BookOpen, Building2, MapPin, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bairroNome: string;
  setorPredominante: string;
}

export function PedagogicoContextualizadorModal({ isOpen, onClose, bairroNome, setorPredominante }: Props) {
  const [escolaNome, setEscolaNome] = useState(`Escola Municipal ${bairroNome}`);
  const [componente, setComponente] = useState('Matemática');
  const [anoEscolar, setAnoEscolar] = useState('8º Ano - GET');
  const [loading, setLoading] = useState(false);
  const [plano, setPlano] = useState<PlanoAulaContextualizado | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateLessonPlanAction({
        escola_nome: escolaNome,
        bairro_nome: bairroNome,
        setor_predominante: setorPredominante,
        componente_curricular: componente,
        ano_escolar: anoEscolar,
        hub_proximo: setorPredominante.includes('Tecnologia') ? 'Hub Porto Maravalley & IMPA Tech' : undefined,
      });
      setPlano(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistente Pedagógico Intersetorial (RAG)</h2>
              <p className="text-xs text-slate-400">Contextualizando o Currículo Carioca com a economia de {bairroNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Escola Municipal</label>
              <input
                type="text"
                value={escolaNome}
                onChange={e => setEscolaNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Setor Econômico (SMDEIS)</label>
              <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-blue-400 font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                {setorPredominante}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Componente Curricular</label>
              <select
                value={componente}
                onChange={e => setComponente(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Matemática">Matemática</option>
                <option value="Ciências / Tecnologia">Ciências / Tecnologia</option>
                <option value="História / Geografia">História / Geografia</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Ano Escolar / Segmento</label>
              <select
                value={anoEscolar}
                onChange={e => setAnoEscolar(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="7º Ano - GET">7º Ano - GET</option>
                <option value="8º Ano - GET">8º Ano - GET</option>
                <option value="9º Ano - GET">9º Ano - GET</option>
                <option value="EJA III - Noturno">EJA III - Noturno</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Gerar Plano de Aula Contextualizado pela IA
          </button>

          {plano && (
            <div className="space-y-4 border-t border-slate-800 pt-5 animate-fadeIn">
              <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <BookOpen className="w-4 h-4" /> Tema da Aula Contextualizada
                </div>
                <h3 className="text-lg font-bold text-white">{plano.tema_aula}</h3>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Objetivos de Aprendizagem</h4>
                <ul className="space-y-1.5">
                  {plano.objetivos_aprendizagem.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Projeto Prático Local
                </h4>
                <p className="text-sm text-slate-300">{plano.projeto_pratico_local}</p>
              </div>

              <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-800/40">
                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Conexão com Hubs Econômicos
                </h4>
                <p className="text-sm text-slate-300">{plano.conexao_hubs_locais}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
