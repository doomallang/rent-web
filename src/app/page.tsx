import HeroSection from "@/components/home/HeroSection";
import FeaturedCars from "@/components/home/FeaturedCars";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCars />
      <Stats />
      <HowItWorks />
    </>
  );
}
