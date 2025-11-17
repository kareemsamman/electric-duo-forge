import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Placeholder logo data - can be moved to CMS later
const logos = [
  { name: "חברת החשמל", url: "/placeholder.svg" },
  { name: "משרד הביטחון", url: "/placeholder.svg" },
  { name: "משרד הבריאות", url: "/placeholder.svg" },
  { name: "אזור תעשייה", url: "/placeholder.svg" },
  { name: "חיל האוויר", url: "/placeholder.svg" },
  { name: "רכבת ישראל", url: "/placeholder.svg" },
  { name: "קריית הטכניון", url: "/placeholder.svg" },
  { name: "תעשיות", url: "/placeholder.svg" },
];

const ClientLogos = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t("clients.title")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto text-sm">
            {t("clients.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {logos.map((logo, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/6">
                  <div className="flex items-center justify-center h-24 p-4 bg-background rounded-lg border border-border hover:shadow-md transition-shadow">
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </FadeIn>
      </div>
    </section>
  );
};

export default ClientLogos;
