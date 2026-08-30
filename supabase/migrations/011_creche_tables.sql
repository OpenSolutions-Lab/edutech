-- 011_creche_tables.sql
-- Tabela e estruturas para Inscrição de Creche (Match Perfeito - SME-Rio)

-- 1. Unidades de Creche / EDI
CREATE TABLE IF NOT EXISTS creche_unidades (
  id VARCHAR(50) PRIMARY KEY,
  designacao VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'EDI', -- EDI, Creche, Parcial
  cre VARCHAR(20) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  endereco TEXT,
  cep VARCHAR(20),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  vagas_oferecidas INT DEFAULT 0,
  vagas_ociosas INT DEFAULT 0,
  fila_espera INT DEFAULT 0,
  confirmados INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index espacial
CREATE INDEX IF NOT EXISTS idx_creche_unidades_loc ON creche_unidades USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_creche_unidades_cre ON creche_unidades (cre);
CREATE INDEX IF NOT EXISTS idx_creche_unidades_bairro ON creche_unidades (bairro);

-- 2. Inscrições de Creche (Anonimizadas)
CREATE TABLE IF NOT EXISTS creche_inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_opcao BIGINT NOT NULL,
  id_inscricao VARCHAR(50) NOT NULL,
  id_crianca VARCHAR(50) NOT NULL,
  id_responsavel VARCHAR(50) NOT NULL,
  processo_ano INT NOT NULL, -- 2021, 2022, 2023, 2024, 2025
  opcao_prioridade INT NOT NULL, -- 1 a 5
  unidade_id VARCHAR(50) REFERENCES creche_unidades(id) ON DELETE SET NULL,
  grupamento VARCHAR(50) NOT NULL, -- Bercario_I, Bercario_II, Maternal_I, Maternal_II
  turno VARCHAR(50) DEFAULT 'Integral', -- Integral, Manha, Tarde
  status VARCHAR(50) NOT NULL, -- Ativa, Selecionada, Confirmada, Cancelada, Fila
  pontuacao_socioeconomica INT DEFAULT 0,
  pontuacao_detalhes JSONB DEFAULT '{}'::jsonb,
  data_inscricao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creche_inscricoes_crianca ON creche_inscricoes (id_crianca);
CREATE INDEX IF NOT EXISTS idx_creche_inscricoes_resp ON creche_inscricoes (id_responsavel);
CREATE INDEX IF NOT EXISTS idx_creche_inscricoes_ano ON creche_inscricoes (processo_ano);
CREATE INDEX IF NOT EXISTS idx_creche_inscricoes_status ON creche_inscricoes (status);
CREATE INDEX IF NOT EXISTS idx_creche_inscricoes_unidade ON creche_inscricoes (unidade_id);

-- 3. Catálogo de Réguas por Ano/Processo
CREATE TABLE IF NOT EXISTS creche_catalogo_reguas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_ano INT NOT NULL,
  codigo_pergunta VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  pontos INT NOT NULL,
  tipo_criterio VARCHAR(50) DEFAULT 'Socioeconomico',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. View de Saldo Oferta x Demanda por Unidade
CREATE OR REPLACE VIEW vw_saldo_oferta_demanda AS
SELECT 
  u.id AS unidade_id,
  u.designacao,
  u.cre,
  u.bairro,
  u.lat,
  u.lng,
  u.vagas_oferecidas,
  u.vagas_ociosas,
  COUNT(CASE WHEN i.status IN ('Fila', 'Ativa') THEN 1 END) AS fila_total,
  COUNT(CASE WHEN i.status = 'Confirmada' THEN 1 END) AS total_confirmados,
  COUNT(CASE WHEN i.status = 'Selecionada' THEN 1 END) AS total_selecionados,
  CASE 
    WHEN (COUNT(CASE WHEN i.status IN ('Fila', 'Ativa') THEN 1 END) + u.confirmados) > 0 
    THEN ROUND(
      COUNT(CASE WHEN i.status IN ('Fila', 'Ativa') THEN 1 END)::NUMERIC / 
      (COUNT(CASE WHEN i.status IN ('Fila', 'Ativa') THEN 1 END) + u.confirmados)::NUMERIC, 
      3
    )
    ELSE 0 
  END AS indice_pressao
FROM creche_unidades u
LEFT JOIN creche_inscricoes i ON u.id = i.unidade_id
GROUP BY u.id, u.designacao, u.cre, u.bairro, u.lat, u.lng, u.vagas_oferecidas, u.vagas_ociosas, u.confirmados;

-- 5. View de Detecção de Duplicidades (Crianças com > 1 vaga/opção Ativa/Selecionada)
CREATE OR REPLACE VIEW vw_duplicidade_cpf AS
SELECT 
  id_crianca,
  processo_ano,
  COUNT(DISTINCT id_opcao) AS total_opcoes,
  COUNT(DISTINCT CASE WHEN status IN ('Ativa', 'Selecionada') THEN id_opcao END) AS opcoes_ativas,
  ARRAY_AGG(DISTINCT unidade_id) AS unidades_seguradas,
  ARRAY_AGG(DISTINCT status) AS status_list
FROM creche_inscricoes
GROUP BY id_crianca, processo_ano
HAVING COUNT(DISTINCT CASE WHEN status IN ('Ativa', 'Selecionada') THEN id_opcao END) > 1;
