-- 007_smdeis_integration.sql
-- Integração Intersetorial: Secretaria de Educação (SME) + Desenvolvimento Econômico (SMDEIS / DATA.RIO)

-- 1. Hierarquia Territorial Universal do Município do Rio de Janeiro
CREATE TABLE IF NOT EXISTS areas_planejamento (
  codigo_ap VARCHAR(10) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS regioes_administrativas (
  codigo_ra INTEGER PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  codigo_ap VARCHAR(10) REFERENCES areas_planejamento(codigo_ap),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas de chaves universais na tabela bairros se não existirem
ALTER TABLE bairros 
  ADD COLUMN IF NOT EXISTS codigo_bairro INTEGER UNIQUE,
  ADD COLUMN IF NOT EXISTS codigo_ra INTEGER REFERENCES regioes_administrativas(codigo_ra),
  ADD COLUMN IF NOT EXISTS codigo_ap VARCHAR(10) REFERENCES areas_planejamento(codigo_ap);

-- 2. Tabela de Indicadores Econômicos por Bairro (SMDEIS DATA.RIO)
CREATE TABLE IF NOT EXISTS smdeis_bairros_economia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_bairro INTEGER UNIQUE REFERENCES bairros(codigo_bairro) ON DELETE CASCADE,
  nome_bairro VARCHAR(150) NOT NULL,
  regiao_administrativa VARCHAR(100) NOT NULL,
  taxa_emprego_formal NUMERIC(5,2) DEFAULT 0.00,
  variacao_emprego_12m NUMERIC(5,2) DEFAULT 0.00,
  empresas_ativas_total INTEGER DEFAULT 0,
  mei_mulheres_total INTEGER DEFAULT 0,
  trabalhadoras_formais_pct NUMERIC(5,2) DEFAULT 0.00,
  setor_predominante VARCHAR(100) NOT NULL DEFAULT 'Servicos',
  novos_licenciamentos_imobiliarios INTEGER DEFAULT 0,
  unidades_habitacionais_projetadas INTEGER DEFAULT 0,
  investimento_publico_privado_milhoes NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hubs Econômicos, Tecnológicos e Industriais (SMDEIS)
CREATE TABLE IF NOT EXISTS smdeis_hubs_economicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo_hub VARCHAR(50) NOT NULL, -- 'Tecnologia', 'Logistica', 'Industrial', 'Economia Criativa'
  codigo_bairro INTEGER REFERENCES bairros(codigo_bairro),
  descricao TEXT,
  localizacao GEOMETRY(Point, 4326),
  raio_influencia_km NUMERIC(4,1) DEFAULT 3.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Microdados do Observatório do Trabalho (Vagas & Mercado Formal)
CREATE TABLE IF NOT EXISTS smdeis_observatorio_emprego (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_bairro INTEGER REFERENCES bairros(codigo_bairro),
  setor_economico VARCHAR(100) NOT NULL,
  vagas_abertas_mes INTEGER DEFAULT 0,
  candidatos_inscritos INTEGER DEFAULT 0,
  demanda_qualificacao_tecnica VARCHAR(150),
  mes_referencia INTEGER DEFAULT 8,
  ano_referencia INTEGER DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índice de Desenvolvimento Social (IDS IPP / SME / SMDEIS)
CREATE TABLE IF NOT EXISTS smdeis_bairros_ids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_bairro INTEGER UNIQUE REFERENCES bairros(codigo_bairro),
  ids_score NUMERIC(5,4) NOT NULL CHECK (ids_score BETWEEN 0 AND 1),
  subindice_educacao NUMERIC(5,4),
  subindice_renda_trabalho NUMERIC(5,4),
  subindice_infraestrutura NUMERIC(5,4),
  faixa_vulnerabilidade VARCHAR(20) NOT NULL CHECK (faixa_vulnerabilidade IN ('Baixa', 'Media', 'Alta', 'Extrema')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_smdeis_bairros_codigo ON smdeis_bairros_economia(codigo_bairro);
CREATE INDEX IF NOT EXISTS idx_smdeis_hubs_loc ON smdeis_hubs_economicos USING GIST(localizacao);
CREATE INDEX IF NOT EXISTS idx_smdeis_obs_bairro ON smdeis_observatorio_emprego(codigo_bairro);
CREATE INDEX IF NOT EXISTS idx_smdeis_ids_bairro ON smdeis_bairros_ids(codigo_bairro);

-- 6. Funções RPC PostGIS Intersetoriais

-- RPC: Identificar vazios de creches cruzando com mães no mercado formal (MEIs e Trabalho Formal)
CREATE OR REPLACE FUNCTION fn_vazios_creches_trabalhadoras()
RETURNS TABLE (
  bairro_nome VARCHAR,
  codigo_bairro INTEGER,
  populacao_0_5 INTEGER,
  trabalhadoras_formais_pct NUMERIC,
  mei_mulheres_total INTEGER,
  vagas_creches INTEGER,
  deficit_creches INTEGER,
  score_prioridade NUMERIC
) LANGUAGE SQL STABLE AS $$
  SELECT
    b.nome AS bairro_nome,
    b.codigo_bairro,
    b.populacao_0_5,
    COALESCE(e.trabalhadoras_formais_pct, 0) AS trabalhadoras_formais_pct,
    COALESCE(e.mei_mulheres_total, 0) AS mei_mulheres_total,
    COALESCE(SUM(esc.capacidade_maxima), 0)::INTEGER AS vagas_creches,
    GREATEST(b.populacao_0_5 - COALESCE(SUM(esc.capacidade_maxima), 0), 0)::INTEGER AS deficit_creches,
    ROUND(
      (GREATEST(b.populacao_0_5 - COALESCE(SUM(esc.capacidade_maxima), 0), 0) * 0.5) +
      (COALESCE(e.trabalhadoras_formais_pct, 0) * 10) +
      (COALESCE(e.mei_mulheres_total, 0) * 0.05),
      2
    ) AS score_prioridade
  FROM bairros b
  LEFT JOIN smdeis_bairros_economia e ON e.codigo_bairro = b.codigo_bairro
  LEFT JOIN escolas esc ON esc.bairro_id = b.id AND esc.tipo IN ('Creche', 'EDI') AND esc.status = 'ativa'
  GROUP BY b.id, b.nome, b.codigo_bairro, b.populacao_0_5, e.trabalhadoras_formais_pct, e.mei_mulheres_total
  ORDER BY score_prioridade DESC;
$$;

-- RLS Policies
ALTER TABLE areas_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE regioes_administrativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE smdeis_bairros_economia ENABLE ROW LEVEL SECURITY;
ALTER TABLE smdeis_hubs_economicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE smdeis_observatorio_emprego ENABLE ROW LEVEL SECURITY;
ALTER TABLE smdeis_bairros_ids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ap" ON areas_planejamento FOR SELECT USING (true);
CREATE POLICY "public_read_ra" ON regioes_administrativas FOR SELECT USING (true);
CREATE POLICY "public_read_smdeis_economia" ON smdeis_bairros_economia FOR SELECT USING (true);
CREATE POLICY "public_read_smdeis_hubs" ON smdeis_hubs_economicos FOR SELECT USING (true);
CREATE POLICY "public_read_smdeis_emprego" ON smdeis_observatorio_emprego FOR SELECT USING (true);
CREATE POLICY "public_read_smdeis_ids" ON smdeis_bairros_ids FOR SELECT USING (true);
