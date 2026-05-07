-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_carId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_companyId_fkey";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
