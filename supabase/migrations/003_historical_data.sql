-- 003_historical_data.sql
-- Tabelas de dados históricos: Matrículas, Quadro Pessoal, Orçamento

CREATE TABLE matriculas_historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  semestre INTEGER DEFAULT 1 CHECK (semestre IN (1, 2)),
  total_matriculas INTEGER DEFAULT 0,
  total_aprovados INTEGER DEFAULT 0,
  total_reprovados INTEGER DEFAULT 0,
  total_evadidos INTEGER DEFAULT 0,
  total_transferidos INTEGER DEFAULT 0,
  taxa_aprovacao NUMERIC(5,2),
  taxa_reprovacao NUMERIC(5,2),
  taxa_evasao NUMERIC(5,2),
  taxa_distorcao_idade_serie NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, semestre)
);

CREATE TABLE quadro_pessoal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  total_professores INTEGER DEFAULT 0,
  professores_efetivos INTEGER DEFAULT 0,
  professores_contratados INTEGER DEFAULT 0,
  carga_16h INTEGER DEFAULT 0,
  carga_22h INTEGER DEFAULT 0,
  carga_30h INTEGER DEFAULT 0,
  carga_40h INTEGER DEFAULT 0,
  carencia_portugues INTEGER DEFAULT 0,
  carencia_matematica INTEGER DEFAULT 0,
  carencia_ciencias INTEGER DEFAULT 0,
  carencia_ingles INTEGER DEFAULT 0,
  carencia_educacao_fisica INTEGER DEFAULT 0,
  carencia_total INTEGER GENERATED ALWAYS AS (
    carencia_portugues + carencia_matematica + carencia_ciencias +
    carencia_ingles + carencia_educacao_fisica
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, mes)
);

CREATE TABLE orcamento_manutencao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  valor_empenhado NUMERIC(14,2) DEFAULT 0,
  valor_liquidado NUMERIC(14,2) DEFAULT 0,
  valor_pago NUMERIC(14,2) DEFAULT 0,
  gasto_por_aluno NUMERIC(10,2),
  categoria_gasto VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escola_id, ano, categoria_gasto)
);

-- Índices de performance
CREATE INDEX idx_matriculas_escola_ano ON matriculas_historico(escola_id, ano DESC);
CREATE INDEX idx_quadro_escola_ano_mes ON quadro_pessoal(escola_id, ano DESC, mes DESC);
CREATE INDEX idx_orcamento_escola_ano ON orcamento_manutencao(escola_id, ano DESC);
