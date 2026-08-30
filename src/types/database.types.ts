/**
 * Tipos gerados manualmente para o Supabase Database.
 * Em produção, use `npx supabase gen types typescript` para gerar automaticamente.
 */

export type TipoEscola =
  | "Creche"
  | "EDI"
  | "Fundamental_I"
  | "Fundamental_II"
  | "Fundamental_Completo"
  | "CIEP"
  | "Especial"
  | "EJA";

export type NivelRisco = "baixo" | "moderado" | "alto" | "critico";

export type SegmentoEscolar =
  | "Creche"
  | "Pre_Escola"
  | "Fundamental_I"
  | "Fundamental_II"
  | "EJA";

export interface Database {
  public: {
    Tables: {
      cres: {
        Row: {
          id: number;
          nome: string;
          sigla: string;
          endereco: string | null;
          regiao_administrativa: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cres"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cres"]["Insert"]>;
      };
      bairros: {
        Row: {
          id: number;
          nome: string;
          regiao_administrativa: string | null;
          idh: number | null;
          populacao_0_5: number;
          populacao_6_14: number;
          geometria: unknown | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bairros"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bairros"]["Insert"]>;
      };
      escolas: {
        Row: {
          id: string;
          nome: string;
          cre_id: number | null;
          bairro_id: number | null;
          tipo: TipoEscola;
          endereco_completo: string | null;
          localizacao: unknown | null;
          capacidade_maxima: number | null;
          ano_construcao: number | null;
          ar_condicionado: boolean;
          tipologia_predial: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["escolas"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["escolas"]["Insert"]>;
      };
      matriculas_historico: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          semestre: number;
          total_matriculas: number;
          total_aprovados: number;
          total_reprovados: number;
          total_evadidos: number;
          total_transferidos: number;
          taxa_aprovacao: number | null;
          taxa_reprovacao: number | null;
          taxa_evasao: number | null;
          taxa_distorcao_idade_serie: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["matriculas_historico"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["matriculas_historico"]["Insert"]>;
      };
      quadro_pessoal: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          mes: number;
          total_professores: number;
          professores_efetivos: number;
          professores_contratados: number;
          carga_16h: number;
          carga_22h: number;
          carga_30h: number;
          carga_40h: number;
          carencia_portugues: number;
          carencia_matematica: number;
          carencia_ciencias: number;
          carencia_ingles: number;
          carencia_educacao_fisica: number;
          carencia_total: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quadro_pessoal"]["Row"], "id" | "created_at" | "carencia_total">;
        Update: Partial<Database["public"]["Tables"]["quadro_pessoal"]["Insert"]>;
      };
      orcamento_manutencao: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          valor_empenhado: number;
          valor_liquidado: number;
          valor_pago: number;
          gasto_por_aluno: number | null;
          categoria_gasto: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orcamento_manutencao"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["orcamento_manutencao"]["Insert"]>;
      };
      predicoes_evasao: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          semestre: number;
          score_risco: number;
          nivel_risco: NivelRisco;
          fatores_contribuintes: Record<string, unknown>;
          recomendacoes: unknown[];
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["predicoes_evasao"]["Row"], "id" | "calculated_at">;
        Update: Partial<Database["public"]["Tables"]["predicoes_evasao"]["Insert"]>;
      };
      predicoes_rh: {
        Row: {
          id: string;
          cre_id: number | null;
          ano: number;
          mes_projecao: number;
          disciplina: string;
          carencia_projetada: number;
          confianca: number | null;
          detalhamento: Record<string, unknown>;
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["predicoes_rh"]["Row"], "id" | "calculated_at">;
        Update: Partial<Database["public"]["Tables"]["predicoes_rh"]["Insert"]>;
      };
      merenda_dimensionamento: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          mes: number;
          dias_letivos: number;
          matriculas_ativas: number;
          taxa_presenca_media: number;
          refeicoes_estimadas: number;
          custo_estimado: number;
          itens_sugeridos: unknown[];
          calculated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["merenda_dimensionamento"]["Row"], "id" | "calculated_at">;
        Update: Partial<Database["public"]["Tables"]["merenda_dimensionamento"]["Insert"]>;
      };
      fila_espera: {
        Row: {
          id: string;
          escola_id: string | null;
          ano: number;
          mes: number;
          segmento: SegmentoEscolar;
          vagas_disponiveis: number;
          inscritos_fila: number;
          vagas_liberadas_mes: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["fila_espera"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["fila_espera"]["Insert"]>;
      };
    };
    Views: {
      mv_kpis_cidade: {
        Row: {
          total_escolas: number;
          total_matriculas: number;
          taxa_evasao_media: number;
          taxa_aprovacao_media: number;
          custo_medio_por_aluno: number;
          vagas_ociosas: number;
          carencia_total_professores: number;
        };
      };
    };
    Functions: {
      fn_escolas_por_cre: {
        Args: { p_cre_id: number };
        Returns: {
          id: string;
          nome: string;
          tipo: TipoEscola;
          lat: number;
          lng: number;
          total_matriculas: number;
          taxa_evasao: number;
          score_risco: number;
          carencia_total: number;
        }[];
      };
      fn_vazios_educacionais: {
        Args: { p_tipo?: TipoEscola };
        Returns: {
          bairro_nome: string;
          populacao_alvo: number;
          total_vagas: number;
          deficit_estimado: number;
          geometria: unknown;
        }[];
      };
    };
  };
}

// Convenience types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Escola = Tables<"escolas">;
export type CRE = Tables<"cres">;
export type Bairro = Tables<"bairros">;
export type MatriculaHistorico = Tables<"matriculas_historico">;
export type QuadroPessoal = Tables<"quadro_pessoal">;
export type OrcamentoManutencao = Tables<"orcamento_manutencao">;
export type PredicaoEvasao = Tables<"predicoes_evasao">;
export type PredicaoRH = Tables<"predicoes_rh">;
export type MerendaDimensionamento = Tables<"merenda_dimensionamento">;
export type FilaEspera = Tables<"fila_espera">;
