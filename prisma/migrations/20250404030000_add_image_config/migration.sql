-- Adiciona os campos imagePosition e imageScale à tabela Question
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT DEFAULT 'center center';
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "imageScale" DOUBLE PRECISION DEFAULT 1.0; 