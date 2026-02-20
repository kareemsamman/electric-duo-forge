import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import VideoSection from "@/components/home/VideoSection";

import ClientLogos from "@/components/home/ClientLogos";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <FeaturedProducts />
      <StatsStrip />
      <WhyUsSection />
      <VideoSection />
      <ClientLogos />
      <CTASection />
    </div>
  );
};

export default Home;
