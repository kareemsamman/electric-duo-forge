import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import VideoSection from "@/components/home/VideoSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import ClientLogos from "@/components/home/ClientLogos";
import CTASection from "@/components/home/CTASection";
import HeroGallerySlider from "@/components/home/HeroGallerySlider";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HeroGallerySlider />
      <ServicesSection />
      <FeaturedProducts />
      <StatsStrip />
      <WhyUsSection />
      <VideoSection />
      <ProjectsSection />
      <ClientLogos />
      <CTASection />
    </div>
  );
};

export default Home;
