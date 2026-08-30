-- 006_rls_policies.sql
-- Row Level Security para todas as tabelas

-- Habilitar RLS
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE quadro_pessoal ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicoes_evasao ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicoes_rh ENABLE ROW LEVEL SECURITY;
ALTER TABLE merenda_dimensionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE cres ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

-- Dados abertos: leitura pública
CREATE POLICY "public_read_cres" ON cres FOR SELECT USING (true);
CREATE POLICY "public_read_bairros" ON bairros FOR SELECT USING (true);
CREATE POLICY "public_read_escolas" ON escolas FOR SELECT USING (true);
CREATE POLICY "public_read_matriculas" ON matriculas_historico FOR SELECT USING (true);
CREATE POLICY "public_read_orcamento" ON orcamento_manutencao FOR SELECT USING (true);
CREATE POLICY "public_read_fila" ON fila_espera FOR SELECT USING (true);

-- Dados sensíveis: apenas gestores autenticados
CREATE POLICY "auth_read_quadro" ON quadro_pessoal
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_predicoes_evasao" ON predicoes_evasao
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_predicoes_rh" ON predicoes_rh
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_read_merenda" ON merenda_dimensionamento
  FOR SELECT USING (auth.role() = 'authenticated');

-- Escrita: apenas service_role (via Server Actions)
CREATE POLICY "service_write_escolas" ON escolas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_matriculas" ON matriculas_historico
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_quadro" ON quadro_pessoal
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_orcamento" ON orcamento_manutencao
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_predicoes_evasao" ON predicoes_evasao
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_predicoes_rh" ON predicoes_rh
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_merenda" ON merenda_dimensionamento
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_write_fila" ON fila_espera
  FOR ALL USING (auth.role() = 'service_role');
