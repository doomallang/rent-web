import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...");

  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.location.deleteMany();
  await prisma.company.deleteMany();

  // 업체
  const hana = await prisma.company.create({
    data: {
      slug: "hana",
      name: "하나렌터카",
      description: "전국 10개 지점 운영, 24시간 긴급출동 서비스 제공",
      phone: "1588-1234",
      color: "blue",
      primaryColor: "#2563EB",
    },
  });

  const sky = await prisma.company.create({
    data: {
      slug: "sky",
      name: "스카이렌터카",
      description: "공항 픽업 전문, 깨끗하고 관리된 차량",
      phone: "1588-5678",
      color: "sky",
      primaryColor: "#0284C7",
    },
  });

  const jeju = await prisma.company.create({
    data: {
      slug: "jeju",
      name: "제주드라이브",
      description: "제주 전문 렌터카, 현지 최저가 보장",
      phone: "064-000-0000",
      color: "green",
      primaryColor: "#16A34A",
    },
  });

  // 지점
  await prisma.location.createMany({
    data: [
      { companyId: hana.id, name: "서울 강남점", address: "서울 강남구 테헤란로 123", phone: "02-1234-0001" },
      { companyId: hana.id, name: "서울 홍대점", address: "서울 마포구 홍익로 45", phone: "02-1234-0002" },
      { companyId: hana.id, name: "서울 잠실점", address: "서울 송파구 올림픽로 99", phone: "02-1234-0003" },
      { companyId: sky.id,  name: "인천공항 1터미널", address: "인천 중구 공항로 272 1터미널", phone: "032-5678-0001" },
      { companyId: sky.id,  name: "인천공항 2터미널", address: "인천 중구 공항로 272 2터미널", phone: "032-5678-0002" },
      { companyId: sky.id,  name: "김포공항", address: "서울 강서구 하늘길 77", phone: "02-5678-0003" },
      { companyId: sky.id,  name: "부산 해운대점", address: "부산 해운대구 해운대해변로 12", phone: "051-5678-0004" },
      { companyId: jeju.id, name: "제주공항", address: "제주 제주시 공항로 2", phone: "064-0000-0001" },
      { companyId: jeju.id, name: "제주 중문점", address: "제주 서귀포시 중문관광로 55", phone: "064-0000-0002" },
    ],
  });

  // 차량
  const car1 = await prisma.car.create({ data: { companyId: hana.id, name: "아반떼 CN7", brand: "현대", category: "COMPACT", year: 2024, seats: 5, transmission: "AUTO", fuelType: "GASOLINE", pricePerDay: 55000, features: ["블루투스", "후방카메라", "크루즈컨트롤", "USB충전"], description: "연비 좋고 실용적인 준중형 세단.", available: true } });
  const car2 = await prisma.car.create({ data: { companyId: hana.id, name: "쏘나타 DN8", brand: "현대", category: "COMPACT", year: 2024, seats: 5, transmission: "AUTO", fuelType: "HYBRID", pricePerDay: 75000, features: ["블루투스", "후방카메라", "네비게이션", "열선시트", "HUD"], description: "공간감과 연비를 동시에 잡은 하이브리드 중형 세단.", available: true } });
  const car3 = await prisma.car.create({ data: { companyId: hana.id, name: "G80", brand: "제네시스", category: "LUXURY", year: 2024, seats: 5, transmission: "AUTO", fuelType: "GASOLINE", pricePerDay: 180000, features: ["네비게이션", "렉시콘사운드", "마사지시트", "헤드업디스플레이"], description: "프리미엄 대형 세단.", available: true } });
  const car4 = await prisma.car.create({ data: { companyId: sky.id, name: "투싼 NX4", brand: "현대", category: "SUV", year: 2023, seats: 5, transmission: "AUTO", fuelType: "DIESEL", pricePerDay: 85000, features: ["블루투스", "후방카메라", "네비게이션", "파노라마선루프", "4WD"], description: "넉넉한 공간과 강력한 오프로드 성능을 갖춘 SUV.", available: true } });
  const car5 = await prisma.car.create({ data: { companyId: sky.id, name: "팰리세이드", brand: "현대", category: "SUV", year: 2024, seats: 7, transmission: "AUTO", fuelType: "DIESEL", pricePerDay: 120000, features: ["블루투스", "후방카메라", "네비게이션", "3열시트"], description: "7인승 대형 SUV.", available: true } });
  const car6 = await prisma.car.create({ data: { companyId: sky.id, name: "아이오닉6", brand: "현대", category: "COMPACT", year: 2024, seats: 5, transmission: "AUTO", fuelType: "ELECTRIC", pricePerDay: 95000, features: ["블루투스", "후방카메라", "무선충전", "V2L"], description: "전기 세단.", available: false } });
  const car7 = await prisma.car.create({ data: { companyId: jeju.id, name: "카니발 KA4", brand: "기아", category: "VAN", year: 2024, seats: 9, transmission: "AUTO", fuelType: "DIESEL", pricePerDay: 130000, features: ["블루투스", "후방카메라", "네비게이션", "9인승", "파워슬라이딩도어"], description: "9인승 미니밴.", available: true } });
  const car8 = await prisma.car.create({ data: { companyId: jeju.id, name: "레이", brand: "기아", category: "ECONOMY", year: 2023, seats: 5, transmission: "AUTO", fuelType: "GASOLINE", pricePerDay: 40000, features: ["블루투스", "후방카메라", "경차혜택"], description: "경형 SUV.", available: true } });

  // 예약
  await prisma.booking.createMany({
    data: [
      { carId: car1.id, companyId: hana.id, customerName: "김민준", customerPhone: "010-1234-5678", customerEmail: "minjun@email.com", driverLicense: "11-22-334455-66", pickupLocation: "서울 강남점", returnLocation: "서울 강남점", pickupDate: new Date("2026-05-10"), returnDate: new Date("2026-05-13"), status: "CONFIRMED", totalPrice: 165000 },
      { carId: car2.id, companyId: hana.id, customerName: "이서연", customerPhone: "010-2345-6789", customerEmail: "seoyeon@email.com", driverLicense: "22-33-445566-77", pickupLocation: "인천공항 1터미널", returnLocation: "서울 잠실점", pickupDate: new Date("2026-05-08"), returnDate: new Date("2026-05-10"), status: "PENDING", totalPrice: 150000 },
      { carId: car3.id, companyId: hana.id, customerName: "박도윤", customerPhone: "010-3456-7890", customerEmail: "doyun@email.com", driverLicense: "33-44-556677-88", pickupLocation: "서울 강남점", returnLocation: "서울 강남점", pickupDate: new Date("2026-05-07"), returnDate: new Date("2026-05-09"), status: "ACTIVE", totalPrice: 360000 },
      { carId: car4.id, companyId: sky.id, customerName: "최수아", customerPhone: "010-4567-8901", customerEmail: "sua@email.com", driverLicense: "44-55-667788-99", pickupLocation: "인천공항 2터미널", returnLocation: "인천공항 2터미널", pickupDate: new Date("2026-05-12"), returnDate: new Date("2026-05-15"), status: "CONFIRMED", totalPrice: 255000 },
      { carId: car5.id, companyId: sky.id, customerName: "정시우", customerPhone: "010-5678-9012", customerEmail: "siwoo@email.com", driverLicense: "55-66-778899-00", pickupLocation: "김포공항", returnLocation: "서울 홍대점", pickupDate: new Date("2026-05-07"), returnDate: new Date("2026-05-08"), status: "ACTIVE", totalPrice: 120000 },
      { carId: car7.id, companyId: jeju.id, customerName: "윤하은", customerPhone: "010-7890-1234", customerEmail: "haeun@email.com", driverLicense: "77-88-990011-22", pickupLocation: "제주공항", returnLocation: "제주 중문점", pickupDate: new Date("2026-05-09"), returnDate: new Date("2026-05-12"), status: "CONFIRMED", totalPrice: 390000 },
      { carId: car8.id, companyId: jeju.id, customerName: "임준서", customerPhone: "010-8901-2345", customerEmail: "junseo@email.com", driverLicense: "88-99-001122-33", pickupLocation: "제주공항", returnLocation: "제주공항", pickupDate: new Date("2026-05-14"), returnDate: new Date("2026-05-16"), status: "PENDING", totalPrice: 80000 },
      { carId: car1.id, companyId: hana.id, customerName: "한소율", customerPhone: "010-9012-3456", customerEmail: "soyul@email.com", driverLicense: "99-00-112233-44", pickupLocation: "서울 홍대점", returnLocation: "서울 홍대점", pickupDate: new Date("2026-04-28"), returnDate: new Date("2026-04-30"), status: "COMPLETED", totalPrice: 110000 },
      { carId: car4.id, companyId: sky.id, customerName: "오지훈", customerPhone: "010-0123-4567", customerEmail: "jihoon@email.com", driverLicense: "00-11-223344-55", pickupLocation: "부산 해운대점", returnLocation: "부산 해운대점", pickupDate: new Date("2026-05-01"), returnDate: new Date("2026-05-03"), status: "COMPLETED", totalPrice: 170000 },
      { carId: car7.id, companyId: jeju.id, customerName: "신예린", customerPhone: "010-1122-3344", customerEmail: "yerin@email.com", driverLicense: "11-22-334455-66", pickupLocation: "제주 중문점", returnLocation: "제주공항", pickupDate: new Date("2026-05-03"), returnDate: new Date("2026-05-05"), status: "CANCELLED", totalPrice: 260000 },
    ],
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
