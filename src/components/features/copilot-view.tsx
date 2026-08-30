'use client';

import React, { useState } from 'react';
import { processCopilotQuery, CopilotMessage } from '@/actions/copilot-agent';
import { Bot, Send, User, Sparkles, BarChart3, Table as TableIcon, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';

export function CopilotView() {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Olá! Sou o **Copilot Agêntico de Inteligência Educacional** da SME-Rio.\n\nConectado ao **DATA.RIO, IPP, EWS (Sistema de Alerta Precoce)** e aos microdados socioeconômicos do **SMDEIS**.\n\nComo posso ajudar você a analisar a rede municipal hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedVisual: 'stat_cards',
      statCards: [
        { title: 'Escolas Mapeadas (DATA.RIO)', value: '1.590', change: '100% oficial', trend: 'up' },
        { title: 'Bairros IPP', value: '166', change: 'Malha PostGIS', trend: 'up' },
        { title: 'Coordenadorias (CREs)', value: '11 CREs', trend: 'neutral' },
      ],
    },
  ]);
  const [samplePrompts, setSamplePrompts] = useState<string[]>([
    'Crie uma comparação entre a 1ª CRE e a 5ª CRE',
    'Quais bairros têm maior déficit de vagas em creches?',
    'Quais escolas da 8ª CRE apresentam alto risco no EWS?',
    'Qual a relação entre emprego pelo SMDEIS e turmas de creche?',
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const updateDynamicSuggestions = (query: string) => {
    const qLower = query.toLowerCase();
    if (/creche|vaga|infantil|edi/i.test(qLower)) {
      setSamplePrompts([
        'Quais bairros da 10ª CRE têm maior déficit de vagas?',
        'Qual o impacto do aumento de MEIs femininas nas matrículas?',
        'Ver mapa de vazios educacionais PostGIS',
      ]);
    } else if (/evasão|evasao|ews|frequência|assiduidade/i.test(qLower)) {
      setSamplePrompts([
        'Quais escolas da 5ª CRE precisam de Busca Ativa urgente?',
        'Qual a relação entre empregabilidade dos pais e assiduidade?',
        'Compare o risco de evasão entre a 1ª CRE e 6ª CRE',
      ]);
    } else if (/ideb|nota|desempenho|matemática|português/i.test(qLower)) {
      setSamplePrompts([
        'Qual o ganho de IDEB nas escolas climatizadas da 5ª CRE?',
        'Como os Ginásios Educacionais Tecnológicos (GETs) elevam o IDEB?',
        'Compare o IDEB da 1ª, 3ª e 5ª CREs',
      ]);
    } else if (/\d+ª?\s*cre/i.test(qLower) || /compar/i.test(qLower)) {
      setSamplePrompts([
        'Compare a climatização da 1ª CRE com a 5ª CRE',
        'Quais os bairros críticos da 5ª CRE no DATA.RIO?',
        'Qual a taxa de assiduidade na 5ª CRE?',
      ]);
    } else {
      setSamplePrompts([
        'Crie uma comparação entre a 1ª CRE e a 5ª CRE',
        'Como a climatização reduz a taxa de evasão escolar?',
        'Quais são os hubs de tecnologia mais próximos das escolas GET?',
      ]);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    updateDynamicSuggestions(textToSend);

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await processCopilotQuery(textToSend, messages);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Desculpe, ocorreu uma oscilação na resposta da IA. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto p-4 space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-blue-500/20 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-xl text-blue-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Copilot Agêntico de Inteligência Educacional
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DATA.RIO Multidomínio
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              Pergunte sobre comparações entre CREs, vagas, evasão EWS, infraestrutura e mercado de trabalho SMDEIS.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-3xl space-y-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3' : 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-2xl rounded-tl-none p-4'}`}>
              <FormattedMarkdown content={msg.text} />

              {/* Render Stat Cards Widget */}
              {msg.suggestedVisual === 'stat_cards' && msg.statCards && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {msg.statCards.map((card, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
                      <div className="text-xs text-slate-400 font-medium">{card.title}</div>
                      <div className="text-lg font-bold text-white mt-1">{card.value}</div>
                      {card.change && (
                        <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                          {card.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Render Table Widget */}
              {msg.tableData && msg.tableData.length > 0 && (
                <div className="pt-2 overflow-x-auto">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <TableIcon className="w-4 h-4 text-purple-400" /> Quadro Comparativo Multidomínio
                  </div>
                  <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/90 border-b border-slate-700 text-slate-300 font-semibold">
                          <th className="p-2.5">Indicador / Dimensão</th>
                          <th className="p-2.5">1ª CRE</th>
                          <th className="p-2.5">5ª CRE</th>
                          <th className="p-2.5">Destaque Gerencial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {msg.tableData.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-2.5 font-medium text-slate-200">{row.indicador}</td>
                            <td className="p-2.5 text-slate-300">{row.cre1}</td>
                            <td className="p-2.5 text-slate-300">{row.cre2}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {row.destaque}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Render Chart Widget */}
              {msg.chartData && msg.chartData.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-400" /> Visualização Gráfica Integrada
                  </div>
                  <div className="h-52 w-full bg-slate-900/90 rounded-xl p-2 border border-slate-700/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="1ª CRE / Valor Principal" />
                        {msg.chartData.some(d => d.secondary !== undefined) && (
                          <Bar dataKey="secondary" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="5ª CRE / Valor Comparativo" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}



              <div className="text-[10px] text-slate-400 text-right pt-1">
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-1">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-slate-400 text-xs italic">
            <Bot className="w-5 h-5 text-blue-400 animate-spin" />
            <span>Copilot consultando o PostGIS, EWS, SMDEIS e o DATA.RIO...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium">Sugestões rápidas:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Pergunte sobre comparações entre CREs, vagas em creches, evasão EWS ou mercado SMDEIS..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
}
