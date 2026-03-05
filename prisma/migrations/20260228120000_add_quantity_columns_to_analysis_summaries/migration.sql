-- AlterTable
ALTER TABLE "analysis_summaries" ADD COLUMN "totalQuantity" DECIMAL(10,2),
ADD COLUMN "avgQuantity" DECIMAL(10,2),
ADD COLUMN "minQuantity" DECIMAL(10,2),
ADD COLUMN "maxQuantity" DECIMAL(10,2),
ADD COLUMN "avgUnitPrice" DECIMAL(10,4);
