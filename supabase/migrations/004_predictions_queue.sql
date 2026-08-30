-- 004_predictions_queue.sql
-- Tabelas de predições de IA e fila de espera

CREATE TABLE predicoes_evasao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  semestre INTEGER DEFAULT 1,
  score_risco NUMERIC(5,4) CHECK (score_risco BETWEEN 0 AND 1),
  nivel_risco nivel_risco NOT NULL,
  fatores_contribuintes JSONB DEFAULT '{}',
  recomendacoes JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predicoes_rh (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cre_id INTEGER REFERENCES cres(id),
  ano INTEGER NOT NULL,
  mes_projecao INTEGER NOT NULL,
  disciplina VARCHAR(50) NOT NULL,
  carencia_projetada INTEGER DEFAULT 0,
  confianca NUMERIC(5,4),
  detalhamento JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merenda_dimensionamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  dias_letivos INTEGER DEFAULT 20,
  matriculas_ativas INTEGER DEFAULT 0,
  taxa_presenca_media NUMERIC(5,4) DEFAULT 0.85,
  refeicoes_estimadas INTEGER DEFAULT 0,
  custo_estimado NUMERIC(12,2) DEFAULT 0,
  itens_sugeridos JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fila_espera (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  segmento segmento_escolar NOT NULL,
  vagas_disponiveis INTEGER DEFAULT 0,
  inscritos_fila INTEGER DEFAULT 0,
  vagas_liberadas_mes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_predicoes_evasao_escola ON predicoes_evasao(escola_id, calculated_at DESC);
CREATE INDEX idx_predicoes_rh_cre ON predicoes_rh(cre_id, ano, mes_projecao);
CREATE INDEX idx_fila_escola_periodo ON fila_espera(escola_id, ano, mes);
