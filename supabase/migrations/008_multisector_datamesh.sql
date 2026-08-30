-- 008_multisector_datamesh.sql
-- Ingestão de Dados Reais do DATA.RIO e Tabelas Multisetoriais (SMS, COR-Rio/SMTR, CadÚnico, Simulador What-If)

-- 1. Tabela SMS Saúde Escolar (DATA.RIO / SMS-RJ)
CREATE TABLE IF NOT EXISTS sms_saude_escolar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  codigo_bairro INTEGER REFERENCES bairros(codigo_bairro),
  ano INTEGER NOT NULL DEFAULT 2026,
  taxa_cobertura_vacinal NUMERIC(5,2) DEFAULT 92.5,
  incidencia_desnutricao_pct NUMERIC(5,2) DEFAULT 2.1,
  encaminhamentos_posto_saude INTEGER DEFAULT 12,
  visitas_equipe_saude_familia INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano)
);

-- 2. Tabela COR-Rio / SMTR Mobilidade e Clima (DATA.RIO)
CREATE TABLE IF NOT EXISTS cor_eventos_climaticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_bairro INTEGER REFERENCES bairros(codigo_bairro),
  nome_bairro VARCHAR(150),
  ano INTEGER NOT NULL DEFAULT 2026,
  mes INTEGER NOT NULL DEFAULT 8,
  precipitacao_acumulada_mm NUMERIC(7,2) DEFAULT 45.0,
  dias_alerta_temporal INTEGER DEFAULT 2,
  ocorrencias_alagamento_entorno INTEGER DEFAULT 0,
  atraso_medio_transporte_pct NUMERIC(5,2) DEFAULT 8.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela CadÚnico Vulnerabilidade Familiar (DATA.RIO / SMAS)
CREATE TABLE IF NOT EXISTS cadunico_vulnerabilidade (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_bairro INTEGER UNIQUE REFERENCES bairros(codigo_bairro),
  familias_extrema_pobreza INTEGER DEFAULT 450,
  beneficiarios_bolsa_familia INTEGER DEFAULT 1200,
  renda_per_capita_media NUMERIC(10,2) DEFAULT 520.00,
  taxa_vulnerabilidade_social NUMERIC(5,2) DEFAULT 35.4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Registros do Early Warning System (EWS) com Fatores SHAP
CREATE TABLE IF NOT EXISTS ews_alertas_evasao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL DEFAULT 2026,
  turma_serie VARCHAR(50) NOT NULL,
  score_risco_turma NUMERIC(5,4) NOT NULL CHECK (score_risco_turma BETWEEN 0 AND 1),
  nivel_risco nivel_risco NOT NULL,
  fatores_shap JSONB NOT NULL DEFAULT '[]', -- [{fator: 'Faltas', peso: +0.35}, {fator: 'CadÚnico', peso: +0.22}]
  plano_busca_ativa TEXT,
  status_intervencao VARCHAR(50) DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Histórico de Simulações de Políticas Públicas (What-If)
CREATE TABLE IF NOT EXISTS simulacoes_politicas_publicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo_simulacao VARCHAR(255) NOT NULL,
  autor VARCHAR(100) DEFAULT 'Gestor SME',
  orcamento_adicional_milhoes NUMERIC(12,2) NOT NULL,
  professores_novos_contratados INTEGER DEFAULT 0,
  escolas_climatizadas_novas INTEGER DEFAULT 0,
  bolsas_monitoria_total INTEGER DEFAULT 0,
  novos_gets_criados INTEGER DEFAULT 0,
  impacto_projetado_ideb NUMERIC(4,2),
  reducao_evasao_projetada_pct NUMERIC(5,2),
  roi_social_estimado NUMERIC(6,2),
  detalhes_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sms_escola ON sms_saude_escolar(escola_id);
CREATE INDEX IF NOT EXISTS idx_cor_bairro ON cor_eventos_climaticos(codigo_bairro);
CREATE INDEX IF NOT EXISTS idx_cadunico_bairro ON cadunico_vulnerabilidade(codigo_bairro);
CREATE INDEX IF NOT EXISTS idx_ews_escola ON ews_alertas_evasao(escola_id);

-- RLS Policies
ALTER TABLE sms_saude_escolar ENABLE ROW LEVEL SECURITY;
ALTER TABLE cor_eventos_climaticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadunico_vulnerabilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE ews_alertas_evasao ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacoes_politicas_publicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sms" ON sms_saude_escolar FOR SELECT USING (true);
CREATE POLICY "public_read_cor" ON cor_eventos_climaticos FOR SELECT USING (true);
CREATE POLICY "public_read_cadunico" ON cadunico_vulnerabilidade FOR SELECT USING (true);
CREATE POLICY "auth_read_ews" ON ews_alertas_evasao FOR SELECT USING (true);
CREATE POLICY "public_read_simulacoes" ON simulacoes_politicas_publicas FOR SELECT USING (true);
CREATE POLICY "service_write_simulacoes" ON simulacoes_politicas_publicas FOR ALL USING (auth.role() = 'service_role');
