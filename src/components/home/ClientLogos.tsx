import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Client data - can be moved to CMS later
const clients = [
  { name: "חברת החשמל", sector: "תשתיות לאומיות", image: "/placeholder.svg" },
  { name: "משרד הביטחון", sector: "ביטחון", image: "/placeholder.svg" },
  { name: "משרד הבריאות", sector: "בריאות", image: "/placeholder.svg" },
  { name: "אזור תעשייה צפוני", sector: "תעשייה", image: "/placeholder.svg" },
  { name: "חיל האוויר", sector: "ביטחון", image: "/placeholder.svg" },
  { name: "רכבת ישראל", sector: "תחבורה ציבורית", image: "/placeholder.svg" },
  { name: "קריית הטכניון", sector: "אקדמיה", image: "/placeholder.svg" },
  { name: "תעשיות אלקטרוניקה", sector: "תעשייה", image: "/placeholder.svg" },
  { name: "בית חולים כללי", sector: "בריאות", image: "/placeholder.svg" },
  { name: "מפעל ייצור", sector: "תעשייה", image: "/placeholder.svg" },
  { name: "מרכז מסחרי", sector: "מסחר", image: "/placeholder.svg" },
  { name: "מתקן אנרגיה", sector: "אנרגיה", image: "/placeholder.svg" },
];

const ClientLogos = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("clients.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              {t("clients.subtitle")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {clients.map((client, index) => (
                  <CarouselItem key={index} className="pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="bg-white rounded-2xl border border-[rgba(148,163,184,0.25)] p-5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col items-center text-center">
                      <div className="w-full flex items-center justify-center mb-4 h-24">
                        <img
                          src={client.image}
                          alt={client.name}
                          className="max-w-[80%] max-h-full object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-base mb-1 text-foreground">
                        {client.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {client.sector}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground" />
              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground" />
            </Carousel>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ClientLogos;
