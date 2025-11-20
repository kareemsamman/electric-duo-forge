import HeroSection from "@/components/home/HeroSection";
import ValuesCards from "@/components/home/ValuesCards";
import ValuesButtons from "@/components/home/ValuesButtons";
import StatsStrip from "@/components/home/StatsStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import VideoSection from "@/components/home/VideoSection";
import TeamPreview from "@/components/home/TeamPreview";
import ProjectsSection from "@/components/home/ProjectsSection";
import ClientLogos from "@/components/home/ClientLogos";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValuesCards />
      <ValuesButtons />
      <FeaturedProducts />
      <StatsStrip />
      <WhyUsSection />
      <ServicesSection />
      <VideoSection />
      <TeamPreview />
      <ProjectsSection />
      <ClientLogos />
      <CTASection />
    </div>
  );
};

export default Home;
