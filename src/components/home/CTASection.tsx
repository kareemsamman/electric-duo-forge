import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";
import { ProjectInquiryForm } from "@/components/forms/ProjectInquiryForm";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#1a2332] to-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'var(--texture-noise)' }} />
      <div className="container relative mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              מתכננים פרויקט חדש?
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              מלאו את הפרטים ונחזור אליכם בהקדם עם הצעת מחיר מותאמת
            </p>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
            <ProjectInquiryForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CTASection;
