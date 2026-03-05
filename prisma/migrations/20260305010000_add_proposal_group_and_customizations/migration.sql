-- CreateEnum
CREATE TYPE "ProposalGroup" AS ENUM ('TELECOM', 'IT', 'PRINTING');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "proposalGroup" "ProposalGroup" NOT NULL DEFAULT 'IT';

-- CreateTable
CREATE TABLE "proposal_customizations" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "customText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_customizations_analysisId_idx" ON "proposal_customizations"("analysisId");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_customizations_analysisId_sectionKey_key" ON "proposal_customizations"("analysisId", "sectionKey");

-- AddForeignKey
ALTER TABLE "proposal_customizations" ADD CONSTRAINT "proposal_customizations_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
