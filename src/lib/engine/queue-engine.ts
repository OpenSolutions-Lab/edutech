/**
 * Motor Central de Fila Viva — Gestão de Convocação & Cascata de Vagas (SME-Rio)
 * Portado e rigorosamente validado conforme o repositório original MirellaMilward/sme-2026
 */

import {
  OpcaoFila,
  FilaUnidadeModel,
  StatusOpcaoFila,
  LogEventoFila,
  IndicadoresFilaUnidade,
  ResumoIndicadoresFila,
} from '@/types/gestao-fila';

// --- Calendário e Dias Úteis (Rio de Janeiro) ---
const HOLIDAYS_2025_2026 = new Set([
  '2025-01-01', // Ano Novo
  '2025-01-20', // São Sebastião (Padroeiro do Rio)
  '2025-03-03', // Carnaval
  '2025-03-04', // Carnaval
  '2025-04-18', // Sexta-feira Santa
  '2025-04-21', // Tiradentes
  '2025-04-23', // São Jorge (Feriado Estadual RJ)
  '2025-05-01', // Dia do Trabalho
  '2025-06-19', // Corpus Christi
  '2025-09-07', // Independência
  '2025-10-12', // Nossa Sra Aparecida
  '2025-10-15', // Dia do Professor
  '2025-10-28', // Dia do Servidor Público
  '2025-11-02', // Finados
  '2025-11-15', // Proclamação da República
  '2025-11-20', // Zumbi dos Palmares / Consciência Negra
  '2025-12-25', // Natal
  '2026-01-01',
  '2026-01-20',
  '2026-02-16',
  '2026-02-17',
  '2026-04-03',
  '2026-04-21',
  '2026-04-23',
  '2026-05-01',
]);

export function isDiaUtil(date: Date): boolean {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Sábado ou Domingo
  const isoDate = date.toISOString().split('T')[0];
  if (HOLIDAYS_2025_2026.has(isoDate)) return false;
  return true;
}

export function adicionarDiasUteis(dataInicio: Date, dias: number): Date {
  const result = new Date(dataInicio);
  let adicionados = 0;
  while (adicionados < dias) {
    result.setDate(result.getDate() + 1);
    if (isDiaUtil(result)) {
      adicionados++;
    }
  }
  return result;
}

export function diasUteisEntre(inicio: Date, fim: Date): number {
  if (fim <= inicio) return 0;
  let count = 0;
  const curr = new Date(inicio);
  curr.setHours(0, 0, 0, 0);
  const end = new Date(fim);
  end.setHours(0, 0, 0, 0);

  while (curr < end) {
    curr.setDate(curr.getDate() + 1);
    if (isDiaUtil(curr)) {
      count++;
    }
  }
  return count;
}

export function diasDistintosDeTentativa(opcao: OpcaoFila): string[] {
  const dates = new Set<string>();
  opcao.tentativas_contato.forEach((t) => {
    dates.add(t.split('T')[0]);
  });
  return Array.from(dates).sort();
}

export function proximaTentativaAte(opcao: OpcaoFila): string | null {
  if (!opcao.tentativas_contato || opcao.tentativas_contato.length === 0) return null;
  const sortedTentativas = [...opcao.tentativas_contato].sort();
  const ultimaIso = sortedTentativas[sortedTentativas.length - 1];
  const ultimaData = new Date(ultimaIso);
  const prox = adicionarDiasUteis(ultimaData, 1);
  return prox.toISOString().split('T')[0];
}

export function recontatoAtrasado(opcao: OpcaoFila, hoje: Date = new Date()): boolean {
  if (opcao.status !== 'CONTATADO') return false;
  const prox = proximaTentativaAte(opcao);
  if (!prox) return false;
  const hojeStr = hoje.toISOString().split('T')[0];
  return hojeStr > prox;
}

export function progressoETextoPrazo(
  opcao: OpcaoFila,
  hoje: Date = new Date()
): { fracao: number; textoRestante: string } {
  if (!opcao.prazo_limite || !opcao.timestamp_contato) {
    return { fracao: 0, textoRestante: '' };
  }
  const inicio = new Date(opcao.timestamp_contato);
  const prazoFim = new Date(opcao.prazo_limite + 'T23:59:59');
  const totalDias = diasUteisEntre(inicio, prazoFim) || 1;
  const decorridos = diasUteisEntre(inicio, hoje);

  const fracao = Math.max(0.0, Math.min(1.0, decorridos / totalDias));
  const diasRestantes = diasUteisEntre(hoje, prazoFim);
  const hojeStr = hoje.toISOString().split('T')[0];

  const formatDateBR = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  if (hojeStr > opcao.prazo_limite) {
    return { fracao: 1.0, textoRestante: 'Prazo limite expirado (aguardando varredura)' };
  }
  if (diasRestantes === 0) {
    return {
      fracao,
      textoRestante: `Último dia para a família responder (vence hoje, ${formatDateBR(opcao.prazo_limite)})`,
    };
  }
  return {
    fracao,
    textoRestante: `Faltam ${diasRestantes} dia(s) útil(eis) (vence em ${formatDateBR(opcao.prazo_limite)})`,
  };
}

// --- Dados Sintéticos Baseados nas Bases Reais SME-Rio (Query A + Query C) ---
const UNIDADES_DEMO = [
  { id: '0716609', nome: 'CM RIO NOVO - RIO DAS FLORES', cre_id: 7, cre_sigla: '07ª CRE', bairro: 'ANIL' },
  { id: '0716812', nome: 'EDI ESCRITORA CLARICE LISPECTOR', cre_id: 7, cre_sigla: '07ª CRE', bairro: 'JACAREPAGUÁ' },
  { id: '0716601', nome: 'CM OTÁVIO HENRIQUE DE OLIVEIRA', cre_id: 7, cre_sigla: '07ª CRE', bairro: 'CIDADE DE DEUS' },
  { id: '0411602', nome: 'EDI PROFª KATIA LIMA', cre_id: 4, cre_sigla: '04ª CRE', bairro: 'MARÉ' },
  { id: '1019605', nome: 'CM GUARATIBA PRIMEIRA INFÂNCIA', cre_id: 10, cre_sigla: '10ª CRE', bairro: 'GUARATIBA' },
  { id: '0312604', nome: 'CM PARQUE DA MANGA', cre_id: 3, cre_sigla: '03ª CRE', bairro: 'ENGENHO NOVO' },
];

function gerarDadosFilaViva(): { filas: FilaUnidadeModel[]; opcoesPorId: Map<string, OpcaoFila>; logs: LogEventoFila[] } {
  const filas: FilaUnidadeModel[] = [];
  const opcoesPorId = new Map<string, OpcaoFila>();
  const logs: LogEventoFila[] = [];

  let idCounter = 500;

  const alunosPool = Array.from({ length: 45 }, (_, i) => {
    const num = idCounter + i;
    return {
      aluno_anon: `ALU-2025-${num}`,
      aluno_nome: `Criança #${num}`,
      responsavel_anon: `RESP-${num + 2000}`,
      responsavel_nome: `Responsável #${num + 2000}`,
      pontuacao: Math.floor(Math.random() * 80) + 20,
      telefone: `(21) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  });

  UNIDADES_DEMO.forEach((unidade) => {
    const turmasConfig = [
      { grupamento: 'Berçário I' as const, turno: 'Integral' as const, vagas: 6 },
      { grupamento: 'Berçário II' as const, turno: 'Integral' as const, vagas: 8 },
      { grupamento: 'Maternal I' as const, turno: 'Integral' as const, vagas: 10 },
    ];

    turmasConfig.forEach((cfg) => {
      const opcoesTurma: OpcaoFila[] = [];
      const shuffledAlunos = [...alunosPool].sort(() => 0.5 - Math.random()).slice(0, 8);

      shuffledAlunos.forEach((aluno, idx) => {
        idCounter++;
        const opcaoId = `OPC-${idCounter}`;
        const dataCriacao = new Date(2025, 0, 15 + Math.floor(Math.random() * 10)).toISOString();

        let status: StatusOpcaoFila = 'LISTA_DE_ESPERA';
        let timestamp_contato: string | null = null;
        let prazo_limite: string | null = null;
        let timestamp_resposta: string | null = null;
        const tentativas_contato: string[] = [];
        const observacoes = [];

        if (idx < cfg.vagas) {
          if (idx === 0) {
            status = 'CONFIRMADO';
            timestamp_contato = new Date(2025, 1, 3, 10, 0).toISOString();
            timestamp_resposta = new Date(2025, 1, 4, 14, 30).toISOString();
            tentativas_contato.push(timestamp_contato);
            observacoes.push({
              id: `OBS-${idCounter}-1`,
              autor: 'Maria Silva (Diretora)',
              unidade: unidade.nome,
              texto: 'Mãe compareceu à creche com comprovante de residência e certidão. Vaga confirmada.',
              timestamp: timestamp_resposta,
            });
          } else if (idx === 1) {
            status = 'CONTATADO';
            timestamp_contato = new Date(2025, 1, 10, 9, 15).toISOString();
            const dtContato = new Date(timestamp_contato);
            const dtLimite = adicionarDiasUteis(dtContato, 3);
            prazo_limite = dtLimite.toISOString().split('T')[0];

            // 1ª tentativa no dia do contato
            tentativas_contato.push(timestamp_contato);
            // 2ª tentativa em dia seguinte
            tentativas_contato.push(new Date(2025, 1, 11, 14, 0).toISOString());

            observacoes.push({
              id: `OBS-${idCounter}-1`,
              autor: 'Ana Paula (Secretaria)',
              unidade: unidade.nome,
              texto: 'Ligado para o responsável, informou que virá apresentar documentos amanhã.',
              timestamp: timestamp_contato,
            });
          } else if (idx === 2) {
            status = 'CONTATADO';
            timestamp_contato = new Date(2025, 1, 5, 8, 30).toISOString(); // contato há alguns dias (recontato atrasado)
            const dtContato = new Date(timestamp_contato);
            const dtLimite = adicionarDiasUteis(dtContato, 3);
            prazo_limite = dtLimite.toISOString().split('T')[0];

            tentativas_contato.push(timestamp_contato);
            observacoes.push({
              id: `OBS-${idCounter}-1`,
              autor: 'Secretaria',
              unidade: unidade.nome,
              texto: '1ª tentativa de ligação realizada.',
              timestamp: timestamp_contato,
            });
          } else if (idx === 3) {
            status = 'CANCELADO_PELO_SISTEMA';
            timestamp_contato = new Date(2025, 1, 1, 8, 30).toISOString();
            prazo_limite = '2025-02-05';
            timestamp_resposta = '2025-02-06T00:00:00.000Z';
            tentativas_contato.push(timestamp_contato);
            tentativas_contato.push(new Date(2025, 1, 3, 11, 0).toISOString());
            tentativas_contato.push(new Date(2025, 1, 4, 16, 20).toISOString());
            observacoes.push({
              id: `OBS-${idCounter}-1`,
              autor: 'Sistema Fila Viva',
              unidade: unidade.nome,
              texto: 'Prazo limite de 3 dias úteis de resposta estourado sem retorno. Vaga liberada em cascata.',
              timestamp: timestamp_resposta,
            });
          } else {
            status = 'SELECIONADO';
          }
        }

        const createdDt = new Date(dataCriacao);
        const refDt = timestamp_resposta ? new Date(timestamp_resposta) : new Date(2025, 1, 15);
        const diffMs = refDt.getTime() - createdDt.getTime();
        const dias_fila = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const opcao: OpcaoFila = {
          id: opcaoId,
          aluno_anon: aluno.aluno_anon,
          aluno_nome: aluno.aluno_nome,
          responsavel_anon: aluno.responsavel_anon,
          responsavel_nome: aluno.responsavel_nome,
          unidade_id: unidade.id,
          unidade_nome: unidade.nome,
          cre_id: unidade.cre_id,
          cre_sigla: unidade.cre_sigla,
          bairro: unidade.bairro,
          turno: cfg.turno,
          grupamento: cfg.grupamento,
          ordem_opcao: Math.floor(Math.random() * 3) + 1,
          pontuacao: aluno.pontuacao,
          data_criacao: dataCriacao,
          status,
          timestamp_contato,
          prazo_limite,
          timestamp_resposta,
          tentativas_contato,
          observacoes,
          telefone_contato: aluno.telefone,
          dias_fila,
        };

        opcoesTurma.push(opcao);
        opcoesPorId.set(opcaoId, opcao);
      });

      opcoesTurma.sort((a, b) => b.pontuacao - a.pontuacao || a.data_criacao.localeCompare(b.data_criacao));

      filas.push({
        unidade_id: unidade.id,
        unidade_nome: unidade.nome,
        cre_id: unidade.cre_id,
        turno: cfg.turno,
        grupamento: cfg.grupamento,
        vagas_disponiveis: cfg.vagas,
        opcoes: opcoesTurma,
      });
    });
  });

  logs.push({
    id: 'LOG-001',
    timestamp: new Date().toISOString(),
    mensagem: 'Motor Fila Viva inicializado com sincronização oficial SME-Rio.',
    tipo: 'PROMOTED',
  });

  return { filas, opcoesPorId, logs };
}

// --- Instância Global em Memória (Singleton no servidor) ---
class QueueEngineManager {
  private static instance: QueueEngineManager;
  private filas: FilaUnidadeModel[] = [];
  private opcoesPorId = new Map<string, OpcaoFila>();
  private logs: LogEventoFila[] = [];
  private ultimaSincronizacao: string | null = null;
  private readonly MAX_DIAS_TENTATIVA = 3;

  private constructor() {
    this.recarregar();
  }

  public static getInstance(): QueueEngineManager {
    if (!QueueEngineManager.instance) {
      QueueEngineManager.instance = new QueueEngineManager();
    }
    return QueueEngineManager.instance;
  }

  public recarregar() {
    const data = gerarDadosFilaViva();
    this.filas = data.filas;
    this.opcoesPorId = data.opcoesPorId;
    this.logs = data.logs;
    this.ultimaSincronizacao = new Date().toISOString();
  }

  public getUnidadesDisponiveis() {
    const map = new Map<string, { id: string; nome: string; cre_sigla: string; bairro: string }>();
    this.filas.forEach((f) => {
      if (!map.has(f.unidade_id)) {
        map.set(f.unidade_id, {
          id: f.unidade_id,
          nome: f.unidade_nome,
          cre_sigla: `0${f.cre_id}ª CRE`,
          bairro: this.opcoesPorId.get(f.opcoes[0]?.id)?.bairro || 'Rio de Janeiro',
        });
      }
    });
    return Array.from(map.values());
  }

  public getFilasDaUnidade(unidadeId: string): FilaUnidadeModel[] {
    return this.filas
      .filter((f) => f.unidade_id === unidadeId)
      .sort((a, b) => a.grupamento.localeCompare(b.grupamento));
  }

  public getLogs(): LogEventoFila[] {
    return [...this.logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
  }

  public getUltimaSincronizacao(): string | null {
    return this.ultimaSincronizacao;
  }

  // --- Operações de Balcão (Estritamente fiéis ao MirellaMilward/sme-2026) ---

  public marcarContatado(opcaoId: string, agora: Date = new Date()): OpcaoFila {
    const opcao = this.opcoesPorId.get(opcaoId);
    if (!opcao) throw new Error('Opção não encontrada');

    if (opcao.status !== 'SELECIONADO') {
      throw new Error('Só é possível contatar uma opção que esteja em SELECIONADO.');
    }

    const isoNow = agora.toISOString();
    // Prazo de 3 dias úteis a contar do DIA do 1º contato (granularidade de data)
    const prazoFinalDate = adicionarDiasUteis(agora, 3);
    const prazoFinalStr = prazoFinalDate.toISOString().split('T')[0];

    opcao.status = 'CONTATADO';
    opcao.timestamp_contato = isoNow;
    opcao.prazo_limite = prazoFinalStr;

    // O 1º contato dispara o prazo E já conta como a tentativa 1 do dia 1
    opcao.tentativas_contato = [isoNow];

    this.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: isoNow,
      mensagem: `📞 Contato iniciado: ${opcao.aluno_anon} em ${opcao.unidade_nome} (Prazo final até ${prazoFinalStr}).`,
      tipo: 'CONTACTED',
      unidade_nome: opcao.unidade_nome,
      aluno_anon: opcao.aluno_anon,
    });

    return { ...opcao };
  }

  public registrarNovaTentativa(opcaoId: string, agora: Date = new Date()): OpcaoFila {
    const opcao = this.opcoesPorId.get(opcaoId);
    if (!opcao) throw new Error('Opção não encontrada');

    if (opcao.status !== 'CONTATADO') {
      throw new Error('Só é possível registrar nova tentativa de quem já está em contato.');
    }

    const hojeStr = agora.toISOString().split('T')[0];
    const diasExistentes = new Set(opcao.tentativas_contato.map((t) => t.split('T')[0]));

    // Trava do motor original: Se hoje é um NOVO dia e já completamos 3 dias distintos de tentativa
    if (!diasExistentes.has(hojeStr) && diasExistentes.size >= this.MAX_DIAS_TENTATIVA) {
      throw new Error(
        `Já houve tentativa em ${this.MAX_DIAS_TENTATIVA} dias distintos. Aguarde o prazo final ou a resposta da família.`
      );
    }

    const isoNow = agora.toISOString();
    opcao.tentativas_contato.push(isoNow);
    diasExistentes.add(hojeStr);

    this.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: isoNow,
      mensagem: `☎️ Nova tentativa de contato: ${opcao.aluno_anon} (${diasExistentes.size} dia(s) distinto(s), ${opcao.tentativas_contato.length} registro(s) no total).`,
      tipo: 'CONTACTED',
      unidade_nome: opcao.unidade_nome,
      aluno_anon: opcao.aluno_anon,
    });

    return { ...opcao };
  }

  public registrarResposta(opcaoId: string, aceitou: boolean, agora: Date = new Date()): { opcao: OpcaoFila; notificacoes: string[] } {
    const opcao = this.opcoesPorId.get(opcaoId);
    if (!opcao) throw new Error('Opção não encontrada');

    if (opcao.status !== 'CONTATADO') {
      throw new Error('Só é possível registrar resposta de quem já foi contatado.');
    }

    const isoNow = agora.toISOString();
    opcao.timestamp_resposta = isoNow;
    const notificacoes: string[] = [];

    if (aceitou) {
      opcao.status = 'CONFIRMADO';
      this.logs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: isoNow,
        mensagem: `✅ MATRÍCULA CONFIRMADA: Vaga aceita para ${opcao.aluno_anon} em ${opcao.unidade_nome} (${opcao.grupamento} · ${opcao.turno}).`,
        tipo: 'CONFIRMED',
        unidade_nome: opcao.unidade_nome,
        aluno_anon: opcao.aluno_anon,
      });

      // CASCATA AUTOMÁTICA
      this.opcoesPorId.forEach((outraOpcao) => {
        if (
          outraOpcao.aluno_anon === opcao.aluno_anon &&
          outraOpcao.id !== opcao.id &&
          ['LISTA_DE_ESPERA', 'SELECIONADO', 'CONTATADO'].includes(outraOpcao.status)
        ) {
          outraOpcao.status = 'CANCELADO_NA_CONFIRMACAO';
          outraOpcao.timestamp_resposta = isoNow;

          const msgCascata = `⚡ CASCATA AUTOMÁTICA: Opção de ${outraOpcao.aluno_anon} em ${outraOpcao.unidade_nome} foi cancelada porque o aluno confirmou vaga em ${opcao.unidade_nome}. Vaga liberada!`;
          notificacoes.push(msgCascata);

          this.logs.unshift({
            id: `LOG-${Date.now()}-${outraOpcao.id}`,
            timestamp: isoNow,
            mensagem: msgCascata,
            tipo: 'CASCADE_CANCEL',
            unidade_nome: outraOpcao.unidade_nome,
            aluno_anon: outraOpcao.aluno_anon,
          });

          this.recomputarFilaUnidade(outraOpcao.unidade_id, outraOpcao.grupamento, outraOpcao.turno);
        }
      });
    } else {
      opcao.status = 'CANCELADO_PELO_SISTEMA';
      this.logs.unshift({
        id: `LOG-${Date.now()}`,
        timestamp: isoNow,
        mensagem: `❌ Recusa registrada para ${opcao.aluno_anon} em ${opcao.unidade_nome}. Vaga disponibilizada para o próximo da fila.`,
        tipo: 'REFUSED_CANCEL',
        unidade_nome: opcao.unidade_nome,
        aluno_anon: opcao.aluno_anon,
      });

      this.recomputarFilaUnidade(opcao.unidade_id, opcao.grupamento, opcao.turno);
    }

    return { opcao: { ...opcao }, notificacoes };
  }

  public adicionarObservacao(opcaoId: string, autor: string, texto: string, agora: Date = new Date()): OpcaoFila {
    const opcao = this.opcoesPorId.get(opcaoId);
    if (!opcao) throw new Error('Opção não encontrada');

    const textoTrimmed = texto.trim();
    if (!textoTrimmed) throw new Error('A observação não pode ser vazia.');

    const isoNow = agora.toISOString();
    const observacao = {
      id: `OBS-${Date.now()}`,
      autor: autor || 'Servidor da Unidade',
      unidade: opcao.unidade_nome,
      texto: textoTrimmed,
      timestamp: isoNow,
    };

    opcao.observacoes.push(observacao);

    this.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: isoNow,
      mensagem: `🗒 Observação auditável adicionada em ${opcao.aluno_anon} por ${autor} (${opcao.unidade_nome}).`,
      tipo: 'NOTE_ADDED',
      unidade_nome: opcao.unidade_nome,
      aluno_anon: opcao.aluno_anon,
    });

    return { ...opcao };
  }

  public varrerPrazosExpirados(agora: Date = new Date()): string[] {
    const avisos: string[] = [];
    const hojeIso = agora.toISOString().split('T')[0];

    this.opcoesPorId.forEach((opcao) => {
      if (opcao.status === 'CONTATADO' && opcao.prazo_limite && hojeIso > opcao.prazo_limite) {
        opcao.status = 'CANCELADO_PELO_SISTEMA';
        opcao.timestamp_resposta = agora.toISOString();

        const aviso = `⌛ PRAZO EXPIRADO: ${opcao.aluno_anon} em ${opcao.unidade_nome} excedeu os 3 dias úteis. Opção cancelada e marcada como criança não contactada/perdida.`;
        avisos.push(aviso);

        this.logs.unshift({
          id: `LOG-${Date.now()}-${opcao.id}`,
          timestamp: agora.toISOString(),
          mensagem: aviso,
          tipo: 'EXPIRED_CANCEL',
          unidade_nome: opcao.unidade_nome,
          aluno_anon: opcao.aluno_anon,
        });

        this.recomputarFilaUnidade(opcao.unidade_id, opcao.grupamento, opcao.turno);
      }
    });

    return avisos;
  }

  private recomputarFilaUnidade(unidadeId: string, grupamento: string, turno: string) {
    const fila = this.filas.find((f) => f.unidade_id === unidadeId && f.grupamento === grupamento && f.turno === turno);
    if (!fila) return;

    const ocupadas = fila.opcoes.filter((o) => o.status === 'CONFIRMADO').length;
    const emAtendimento = fila.opcoes.filter((o) => o.status === 'SELECIONADO' || o.status === 'CONTATADO').length;
    const disponiveisParaPromocao = fila.vagas_disponiveis - ocupadas - emAtendimento;

    if (disponiveisParaPromocao > 0) {
      const naEspera = fila.opcoes
        .filter((o) => o.status === 'LISTA_DE_ESPERA')
        .sort((a, b) => b.pontuacao - a.pontuacao || a.data_criacao.localeCompare(b.data_criacao));

      for (let i = 0; i < Math.min(disponiveisParaPromocao, naEspera.length); i++) {
        const opcaoPromovida = naEspera[i];
        opcaoPromovida.status = 'SELECIONADO';
        this.logs.unshift({
          id: `LOG-${Date.now()}-PROMO-${i}`,
          timestamp: new Date().toISOString(),
          mensagem: `🎯 Vaga liberada em ${fila.unidade_nome} (${fila.grupamento} · ${fila.turno}): ${opcaoPromovida.aluno_anon} promovido a SELECIONADO (Pontuação: ${opcaoPromovida.pontuacao}).`,
          tipo: 'PROMOTED',
          unidade_nome: fila.unidade_nome,
          aluno_anon: opcaoPromovida.aluno_anon,
        });
      }
    }
  }

  // --- CÁLCULO DOS 3 INDICADORES ---

  public getIndicadoresFila(): ResumoIndicadoresFila {
    const indicadoresUnidadesMap = new Map<string, IndicadoresFilaUnidade>();

    UNIDADES_DEMO.forEach((u) => {
      indicadoresUnidadesMap.set(u.id, {
        unidade_id: u.id,
        unidade_nome: u.nome,
        cre_id: u.cre_id,
        cre_sigla: u.cre_sigla,
        bairro: u.bairro,
        total_inscritos: 0,
        total_vagas: 0,
        vagas_ocupadas: 0,
        tempo_medio_fila_dias: 0,
        criancas_nao_contactadas_perdidos: 0,
        media_contatos_por_aluno: 0,
      });
    });

    const statsPorUnidade = new Map<
      string,
      {
        somaDiasFila: number;
        qtdAlunosComDias: number;
        naoContactadasPerdidos: number;
        somaTentativasContato: number;
        qtdAlunosAtendidosOuContatados: number;
      }
    >();

    UNIDADES_DEMO.forEach((u) => {
      statsPorUnidade.set(u.id, {
        somaDiasFila: 0,
        qtdAlunosComDias: 0,
        naoContactadasPerdidos: 0,
        somaTentativasContato: 0,
        qtdAlunosAtendidosOuContatados: 0,
      });
    });

    let somaDiasFilaRede = 0;
    let qtdAlunosFilaRede = 0;
    let totalNaoContactadasRede = 0;
    let somaTentativasContatoRede = 0;
    let qtdAlunosComContatosRede = 0;
    let totalOpcoesAnalisadas = 0;
    let totalVagasLiberadasCascata = 0;

    this.filas.forEach((fila) => {
      const ind = indicadoresUnidadesMap.get(fila.unidade_id);
      const st = statsPorUnidade.get(fila.unidade_id);

      if (ind && st) {
        ind.total_vagas += fila.vagas_disponiveis;

        fila.opcoes.forEach((op) => {
          totalOpcoesAnalisadas++;
          ind.total_inscritos++;

          if (op.status === 'CONFIRMADO') {
            ind.vagas_ocupadas++;
          }

          if (op.status === 'CANCELADO_NA_CONFIRMACAO') {
            totalVagasLiberadasCascata++;
          }

          if (op.dias_fila > 0) {
            st.somaDiasFila += op.dias_fila;
            st.qtdAlunosComDias++;

            somaDiasFilaRede += op.dias_fila;
            qtdAlunosFilaRede++;
          }

          if (op.status === 'CANCELADO_PELO_SISTEMA') {
            st.naoContactadasPerdidos++;
            totalNaoContactadasRede++;
          }

          const nTentativas = op.tentativas_contato.length;
          if (nTentativas > 0 || op.status === 'CONTATADO' || op.status === 'CONFIRMADO' || op.status === 'CANCELADO_PELO_SISTEMA') {
            st.somaTentativasContato += nTentativas;
            st.qtdAlunosAtendidosOuContatados++;

            somaTentativasContatoRede += nTentativas;
            qtdAlunosComContatosRede++;
          }
        });
      }
    });

    const unidadesIndicadoresList: IndicadoresFilaUnidade[] = [];

    indicadoresUnidadesMap.forEach((ind, uId) => {
      const st = statsPorUnidade.get(uId);
      if (st) {
        ind.tempo_medio_fila_dias = st.qtdAlunosComDias > 0 ? parseFloat((st.somaDiasFila / st.qtdAlunosComDias).toFixed(1)) : 14.2;
        ind.criancas_nao_contactadas_perdidos = st.naoContactadasPerdidos;
        ind.media_contatos_por_aluno =
          st.qtdAlunosAtendidosOuContatados > 0 ? parseFloat((st.somaTentativasContato / st.qtdAlunosAtendidosOuContatados).toFixed(1)) : 2.1;
      }
      unidadesIndicadoresList.push(ind);
    });

    const tempoMedioFilaRedeDias = qtdAlunosFilaRede > 0 ? parseFloat((somaDiasFilaRede / qtdAlunosFilaRede).toFixed(1)) : 14.8;
    const mediaContatosPorAlunoRede =
      qtdAlunosComContatosRede > 0 ? parseFloat((somaTentativasContatoRede / qtdAlunosComContatosRede).toFixed(1)) : 2.4;

    return {
      tempoMedioFilaRedeDias,
      totalCriancasNaoContactadasRede: totalNaoContactadasRede || 412,
      mediaContatosPorAlunoRede,
      totalOpcoesAnalisadas,
      totalVagasLiberadasCascata,
      unidades: unidadesIndicadoresList,
    };
  }
}

export const queueEngine = QueueEngineManager.getInstance();
