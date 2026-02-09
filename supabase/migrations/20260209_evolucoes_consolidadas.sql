-- Tabela para armazenar evolucoes consolidadas geradas por IA
CREATE TABLE IF NOT EXISTS evolucoes_consolidadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES auth.users(id),
    titulo TEXT NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    sessoes_incluidas UUID[] NOT NULL,
    conteudo_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE evolucoes_consolidadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own consolidadas"
    ON evolucoes_consolidadas FOR SELECT
    USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert own consolidadas"
    ON evolucoes_consolidadas FOR INSERT
    WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own consolidadas"
    ON evolucoes_consolidadas FOR UPDATE
    USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own consolidadas"
    ON evolucoes_consolidadas FOR DELETE
    USING (professional_id = auth.uid());

-- Index para busca por paciente
CREATE INDEX idx_evolucoes_consolidadas_patient_id ON evolucoes_consolidadas(patient_id);
CREATE INDEX idx_evolucoes_consolidadas_professional_id ON evolucoes_consolidadas(professional_id);
