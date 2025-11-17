import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import VideoSection from "@/components/home/VideoSection";
import TeamPreview from "@/components/home/TeamPreview";
import GalleryPreview from "@/components/home/GalleryPreview";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsStrip />
      <FeaturedProducts />
      <ServicesSection />
      <WhyUsSection />
      <VideoSection />
      <TeamPreview />
      <GalleryPreview />
      <CTASection />
    </div>
  );
};

export default Home;
