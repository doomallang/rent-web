export interface Company {
  id: string;
  name: string;
  description: string;
  phone: string;
  color: string;
}

export interface Car {
  id: string;
  companyId: string;
  name: string;
  brand: string;
  category: "economy" | "compact" | "suv" | "luxury" | "van";
  year: number;
  seats: number;
  transmission: "auto" | "manual";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  pricePerDay: number;
  image: string;
  features: string[];
  description: string;
  available: boolean;
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

export type CategoryLabel = {
  [key in Car["category"]]: string;
};
