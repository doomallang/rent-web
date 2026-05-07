-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "holidayPrice" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "weekendPrice" INTEGER;

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
