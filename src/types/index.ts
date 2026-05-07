export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string;
  phone: string;
  color: string;
  primaryColor: string;
  _count?: { cars: number; bookings: number };
}

export type CarCategory = "ECONOMY" | "COMPACT" | "SUV" | "LUXURY" | "VAN";
export type Transmission = "AUTO" | "MANUAL";
export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface PricingRule {
  id: string;
  carId: string;
  startDate: string;
  endDate: string;
  price: number;
  label: string;
  createdAt?: string;
}

export interface Car {
  id: string;
  companyId: string;
  name: string;
  brand: string;
  category: CarCategory;
  year: number;
  seats: number;
  transmission: Transmission;
  fuelType: FuelType;
  pricePerDay: number;
  weekendPrice?: number | null;
  holidayPrice?: number | null;
  features: string[];
  description: string;
  imageUrl?: string | null;
  images: string[];
  locationId?: string | null;
  location?: Location;
  available: boolean;
  company?: Company;
  pricingRules?: PricingRule[];
}

export interface Booking {
  id: string;
  carId: string | null;
  companyId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  driverLicense: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  car?: Car;
  company?: Company;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone: string;
  company?: Company;
}

export interface BookingForm {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  carId: string;
  name: string;
  phone: string;
  email: string;
  driverLicense: string;
  requests?: string;
}
