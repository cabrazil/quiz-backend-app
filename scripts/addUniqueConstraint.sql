-- Verifica se a constraint já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Question_text_key'
    ) THEN
        -- Adiciona a constraint unique
        ALTER TABLE "Question" ADD CONSTRAINT "Question_text_key" UNIQUE ("text");
    END IF;
END $$; 