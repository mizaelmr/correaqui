-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BURACO', 'RUA_ALAGADA', 'LIXO_ACUMULADO', 'ILUMINACAO_PUBLICA', 'VAZAMENTO_AGUA', 'ESGOTO', 'ARVORE_CAIDA', 'OBRA_ABANDONADA', 'OUTRO');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('ABERTA', 'EM_ANALISE', 'AGUARDANDO_VALIDACAO', 'RESOLVIDA');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('CRIADA', 'FOTOS_ADICIONADAS', 'CONFIRMADA', 'STATUS_ALTERADO', 'RESOLUCAO_SOLICITADA', 'RESOLUCAO_APROVADA');

-- CreateTable
CREATE TABLE "Occurrence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'ABERTA',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "occurrenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "occurrenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResolutionRequest" (
    "id" TEXT NOT NULL,
    "occurrenceId" TEXT NOT NULL,
    "comment" TEXT,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResolutionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Occurrence_status_idx" ON "Occurrence"("status");

-- CreateIndex
CREATE INDEX "Occurrence_category_idx" ON "Occurrence"("category");

-- CreateIndex
CREATE INDEX "Occurrence_severity_idx" ON "Occurrence"("severity");

-- CreateIndex
CREATE INDEX "Occurrence_latitude_longitude_idx" ON "Occurrence"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
