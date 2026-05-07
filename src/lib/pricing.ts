import { isHoliday, isWeekend } from "./holidays";
import { Car } from "@/types";

type PricingCar = Pick<Car, "pricePerDay" | "weekendPrice" | "holidayPrice" | "pricingRules">;

export type DayBreakdown = {
  date: string;
  price: number;
  type: "평일" | "주말" | "공휴일" | "특별요금";
  label?: string;
};

export function calculatePricing(
  pickupDate: string,
  returnDate: string,
  car: PricingCar
): { total: number; days: number; breakdown: DayBreakdown[] } {
  const pickup = new Date(pickupDate + "T00:00:00");
  const returnD = new Date(returnDate + "T00:00:00");
  const days = Math.max(0, Math.round((returnD.getTime() - pickup.getTime()) / 86400000));

  const breakdown: DayBreakdown[] = [];
  let total = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(pickup);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const rule = car.pricingRules?.find((r) => {
      const start = r.startDate.slice(0, 10);
      const end = r.endDate.slice(0, 10);
      return dateStr >= start && dateStr <= end;
    });

    let price: number;
    let type: DayBreakdown["type"];
    let label: string | undefined;

    if (rule) {
      price = rule.price;
      type = "특별요금";
      label = rule.label || undefined;
    } else if (isHoliday(d) && car.holidayPrice) {
      price = car.holidayPrice;
      type = "공휴일";
    } else if (isWeekend(d) && car.weekendPrice) {
      price = car.weekendPrice;
      type = "주말";
    } else {
      price = car.pricePerDay;
      type = "평일";
    }

    breakdown.push({ date: dateStr, price, type, label });
    total += price;
  }

  return { total, days, breakdown };
}
