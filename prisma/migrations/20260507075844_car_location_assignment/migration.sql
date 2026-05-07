-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
