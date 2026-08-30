'use client';

import React, { useState } from 'react';
import { Send, CheckCheck, Bot, User, CheckCircle2, XCircle, FileText, AlertCircle, RefreshCw, PhoneCall, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  documentsChecklist?: { nome: string; obrigatorio: boolean }[];
}

export function WhatsAppAgentSimulator({
  nomeAluno = 'Bernardo Silva',
  unidadeNome = 'CM RIO NOVO - RIO DAS FLORES (ANIL)',
  prazoDiasRestantes = 2,
  onConcluido
}: {
  nomeAluno?: string;
  unidadeNome?: string;
  prazoDiasRestantes?: number;
  onConcluido?: (status: 'confirmado' | 'recusado') => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `👋 Olá! Sou o *Assistente Virtual da SME-Rio*. \n\nTemos uma excelente notícia! Uma vaga para a criança *${nomeAluno}* foi liberada na creche:\n📍 *${unidadeNome}*.\n\nVocê tem *${prazoDiasRestantes} dias úteis* para confirmar seu interesse e agendar a entrega dos documentos.`,
      timestamp: '10:00',
      quickReplies: ['✅ Quero confirmar a vaga!', '📄 Quais documentos levar?', '❌ Não tenho interesse (Liberar vaga)']
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [statusConvocacao, setStatusConvocacao] = useState<'pendente' | 'confirmado' | 'recusado'>('pendente');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Respostas simuladas do agente de IA da SME
    setTimeout(() => {
      setIsTyping(false);
      const textLower = text.toLowerCase();

      if (textLower.includes('confirmar') || textLower.includes('quero') || textLower.includes('aceito')) {
        setStatusConvocacao('confirmado');
        if (onConcluido) onConcluido('confirmado');

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `🎉 *VAGA RESERVADA COM SUCESSO!*\n\nSua intenção de matrícula para *${nomeAluno}* foi registrada com código de protocolo #CR-${Math.floor(100000 + Math.random() * 900000)}.\n\nPor favor, compareça à unidade *${unidadeNome}* em até 48 horas portando os documentos originais.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            documentsChecklist: [
              { nome: 'Certidão de Nascimento da Criança', obrigatorio: true },
              { nome: 'Documento de Identidade do Responsável (RG/CPF)', obrigatorio: true },
              { nome: 'Comprovante de Residência no município do Rio', obrigatorio: true },
              { nome: 'Cartão de Vacinação Atualizado', obrigatorio: true },
              { nome: 'Comprovante CadÚnico / Bolsa Família (Se houver)', obrigatorio: false }
            ]
          }
        ]);
      } else if (textLower.includes('documentos') || textLower.includes('levar')) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `📋 *Documentação Necessária para Matrícula:*\n\n• Certidão de Nascimento do Aluno\n• RG e CPF do Responsável Legal\n• Comprovante de Residência recente\n• Caderneta de Vacinação em dia\n• Comprovante de trabalho da mãe (opcional para prioridade)\n\nDeseja confirmar seu agendamento para apresentação dos papéis?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickReplies: ['✅ Sim, confirmar vaga agora!', '❌ Não poderei comparecer']
          }
        ]);
      } else if (textLower.includes('não') || textLower.includes('recusar') || textLower.includes('liberar')) {
        setStatusConvocacao('recusado');
        if (onConcluido) onConcluido('recusado');

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Entendido. Agradecemos pela confirmação!\n\nSua opção foi atualizada e a vaga foi *liberada instantaneamente para a próxima criança na fila de espera por CPF*.\n\nCaso necessite de uma nova inscrição no futuro, acesse o portal da SME-Rio.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: (Date.now() + 2).toString(),
            sender: 'system',
            text: `⚡ *Ação Automática de Reoferta:* O próximo CPF da fila (aluno_0083912 - ANIL) foi notificado via WhatsApp em 0,4 segundos.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: `Entendi sua mensagem sobre "${text}". Para agilizar seu atendimento sobre a vaga em *${unidadeNome}*, por favor escolha uma das opções abaixo:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickReplies: ['✅ Quero confirmar a vaga!', '📄 Quais documentos levar?', '❌ Não tenho interesse (Liberar vaga)']
          }
        ]);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-xl mx-auto rounded-3xl border border-emerald-500/30 bg-slate-950 shadow-2xl overflow-hidden text-slate-100 font-sans">
      {/* Header Estilo WhatsApp SME */}
      <div className="bg-emerald-700/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-emerald-600/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Agente Convocação SME-Rio</h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                IA Agêntica
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 flex items-center gap-1">
              <span>Notificação Oficial • Creche</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([
                {
                  id: '1',
                  sender: 'bot',
                  text: `👋 Olá! Sou o *Assistente Virtual da SME-Rio*. \n\nTemos uma excelente notícia! Uma vaga para a criança *${nomeAluno}* foi liberada na creche:\n📍 *${unidadeNome}*.\n\nVocê tem *${prazoDiasRestantes} dias úteis* para confirmar seu interesse e agendar a entrega dos documentos.`,
                  timestamp: '10:00',
                  quickReplies: ['✅ Quero confirmar a vaga!', '📄 Quais documentos levar?', '❌ Não tenho interesse (Liberar vaga)']
                }
              ]);
              setStatusConvocacao('pendente');
            }}
            title="Reiniciar Simulação"
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-600/40 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status da Convocação Banner */}
      {statusConvocacao !== 'pendente' && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between border-b ${
          statusConvocacao === 'confirmado'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            : 'bg-rose-950/80 text-rose-300 border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusConvocacao === 'confirmado' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>Status da Matrícula: <strong>{statusConvocacao === 'confirmado' ? 'CONFIRMADA VIA WHATSAPP' : 'RECUSADA E VAGA REOFERTADA'}</strong></span>
          </div>
          <span className="text-[10px] opacity-75">Sincronizado Supabase</span>
        </div>
      )}

      {/* Áreas de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/90 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] [background-position:0_0] opacity-95">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user'
                ? 'items-end'
                : msg.sender === 'system'
                ? 'items-center'
                : 'items-start'
            }`}
          >
            {msg.sender === 'system' ? (
              <div className="bg-amber-950/80 border border-amber-500/30 text-amber-200 text-xs px-3 py-2 rounded-xl my-1 text-center max-w-md shadow-md">
                {msg.text}
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {/* Checklist de Documentos */}
                {msg.documentsChecklist && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Checklist Obrigatório:
                    </p>
                    {msg.documentsChecklist.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{doc.nome}</span>
                        {doc.obrigatorio && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">Obrigatório</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                </div>
              </div>
            )}

            {/* Botões de Resposta Rápida */}
            {msg.quickReplies && statusConvocacao === 'pendente' && (
              <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                {msg.quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 px-3 py-1.5 rounded-full transition shadow-sm hover:scale-[1.02]"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Agente SME digitando resposta...</span>
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Simular mensagem do responsável..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
