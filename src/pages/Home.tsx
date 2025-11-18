import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import VideoSection from "@/components/home/VideoSection";
import TeamPreview from "@/components/home/TeamPreview";
import ProductsSliderSection from "@/components/home/ProductsSliderSection";
import ProjectsPreview from "@/components/home/ProjectsPreview";
import GalleryPreview from "@/components/home/GalleryPreview";
import ClientLogos from "@/components/home/ClientLogos";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProducts />
      <StatsStrip />
      <WhyUsSection />
      <ServicesSection />
      <VideoSection />
      <TeamPreview />
      <ProductsSliderSection />
      <ProjectsPreview />
      <GalleryPreview />
      <ClientLogos />
      <CTASection />
    </div>
  );
};

export default Home;
