-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_carId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_companyId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "carId" DROP NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
