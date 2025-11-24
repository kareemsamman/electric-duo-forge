import { ProjectInquiryForm } from "@/components/forms/ProjectInquiryForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";

const NewProject = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              מתכננים פרויקט חדש?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              מלאו את הפרטים ונחזור אליכם בהקדם עם הצעת מחיר מותאמת לצרכים שלכם
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 border border-border">
            <ProjectInquiryForm />
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default NewProject;
