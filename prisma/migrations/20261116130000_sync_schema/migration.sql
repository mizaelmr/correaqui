-- Mudanças que antes foram aplicadas só com `prisma db push` e nunca viraram migration

-- AlterEnum
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'FALTA_PAVIMENTACAO';

-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN IF NOT EXISTS "showReporter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'image';
