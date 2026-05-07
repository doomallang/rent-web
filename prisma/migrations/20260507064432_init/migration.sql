-- CreateEnum
CREATE TYPE "CarCategory" AS ENUM ('ECONOMY', 'COMPACT', 'SUV', 'LUXURY', 'VAN');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" "CarCategory" NOT NULL,
    "year" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "pricePerDay" INTEGER NOT NULL,
    "features" TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "driverLicense" TEXT NOT NULL DEFAULT '',
    "pickupLocation" TEXT NOT NULL,
    "returnLocation" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalPrice" INTEGER NOT NULL,
    "requests" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
