'use client';

import React, { useState, useEffect } from 'react';
import { generateExecutiveReportData, ExecutiveReportData } from '@/actions/executive-report';
import { FileText, Download, Printer, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { FormattedMarkdown } from '@/components/ui/formatted-markdown';

export function PDFExecutiveReportView() {
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null);
  const [creId, setCreId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await generateExecutiveReportData(creId || undefined);
        setReportData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [creId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Gerador de Relatórios Executivos (PDF)
          </h1>
          <p className="text-xs text-slate-400">
            Documento gerencial formatado com dados reais do DATA.RIO e síntese preditiva por IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={creId}
            onChange={(e) => setCreId(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value={0}>Todas as CREs (Visão Geral)</option>
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{`${i + 1}ª CRE`}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      {reportData && (
        <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 print:border-none print:p-0 print:shadow-none print:bg-white print:text-black">
          {/* Header Document Standard */}
          <div className="flex justify-between items-start border-b border-slate-800 print:border-slate-300 pb-6">
            <div>
              <div className="text-xs font-bold text-blue-400 print:text-blue-700 uppercase tracking-widest">
                PREFEITURA DA CIDADE DO RIO DE JANEIRO — SECRETARIA MUNICIPAL DE EDUCAÇÃO
              </div>
              <h2 className="text-2xl font-extrabold text-white print:text-black mt-1">
                {reportData.titulo}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">{reportData.subtitulo}</p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-600">
              <div>Emissão: <strong>{reportData.dataEmissao}</strong></div>
              <div>Fonte: <strong>DATA.RIO / IPP / SME</strong></div>
            </div>
          </div>

          {/* KPI Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {reportData.kpis.map((k, idx) => (
              <div key={idx} className="bg-slate-900/90 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-xl p-4">
                <div className="text-xs text-slate-400 print:text-slate-600 font-medium">{k.rotulo}</div>
                <div className="text-2xl font-black text-white print:text-black mt-1">{k.valor}</div>
                <div className="text-[11px] text-blue-400 print:text-blue-700 font-semibold mt-0.5">{k.variacao}</div>
              </div>
            ))}
          </div>

          {/* AI Narrative Executive Summary */}
          <div className="bg-blue-950/30 print:bg-blue-50 border border-blue-500/30 print:border-blue-200 rounded-xl p-5 space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Síntese Executiva Gerada por Inteligência Artificial
            </h3>
            <FormattedMarkdown content={reportData.resumoExecutivoIa} />
          </div>

          {/* Critical Neighborhoods Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Bairros Críticos para Expansão de Vagas (Vazios Educacionais DATA.RIO)
            </h3>
            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 print:bg-slate-200 text-slate-300 print:text-slate-700 font-bold border-b border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-3">Bairro</th>
                    <th className="p-3">Região Administrativa</th>
                    <th className="p-3 text-right">Déficit de Vagas Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {reportData.bairrosCriticos.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 print:hover:bg-slate-50">
                      <td className="p-3 font-semibold text-white print:text-black">{b.nome}</td>
                      <td className="p-3 text-slate-400 print:text-slate-600">{b.ra}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400 print:text-rose-700">{b.deficit} vagas</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Schools List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white print:text-black">
              Amostra Georreferenciada de Unidades da Rede ({reportData.escolasDestaque.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {reportData.escolasDestaque.map((e, idx) => (
                <div key={idx} className="bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-lg p-3">
                  <div className="font-bold text-white print:text-black">{e.nome}</div>
                  <div className="text-slate-400 print:text-slate-600">{e.tipo} • {e.bairro} ({e.cre})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer Stamp */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
            <div>EduRio-Insights Platform — Validação de Integridade Territorial com PostGIS & DATA.RIO</div>
            <div>Página 1 de 1</div>
          </div>
        </div>
      )}
    </div>
  );
}
