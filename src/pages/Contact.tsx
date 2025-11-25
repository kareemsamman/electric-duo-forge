import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import { motion } from "framer-motion";
import { sendEmailViaGmail } from "@/lib/emailService";
import { toast } from "sonner";

const Contact = () => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendEmailViaGmail({
        form_type: "Contact",
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: language === 'he' ? 'טופס יצירת קשר חדש' : 'New Contact Form Submission',
        Phone: formData.phone
      });

      if (result.success) {
        toast.success(language === 'he' ? 'ההודעה נשלחה בהצלחה! נשלח אליך אישור למייל.' : 'Message sent successfully! A confirmation has been sent to your email.');
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשליחת ההודעה' : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center animate-fade-in">
          {t("contact.title")}
        </h1>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="animate-fade-in hover:shadow-xl transition-all">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input 
                    placeholder={t("contact.form.name")} 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Input 
                    type="email" 
                    placeholder={t("contact.form.email")} 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Input 
                    type="tel" 
                    placeholder={t("contact.form.phone")} 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Textarea 
                    placeholder={t("contact.form.message")} 
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 hover:scale-105 transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (language === 'he' ? 'שולח...' : 'Sending...') : t("contact.form.submit")}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 hover:scale-105 transition-all"
                    onClick={() => window.open('https://wa.me/972501234567', '_blank')}
                  >
                    {t("contact.form.whatsapp")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="animate-fade-in hover:shadow-xl transition-all" style={{ animationDelay: "100ms" }}>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="text-accent" />
                    <div>
                      <p className="font-medium">{t("contact.info.phone")}</p>
                      <p className="text-muted-foreground">+972-50-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-accent" />
                    <div>
                      <p className="font-medium">{t("contact.info.email")}</p>
                      <p className="text-muted-foreground">info@globalelectric.co.il</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-accent" />
                    <div>
                      <p className="font-medium">{t("contact.info.address")}</p>
                      <p className="text-muted-foreground">
                        {language === "he" ? "רחוב התעשייה 1, תל אביב" : "1 Industry St, Tel Aviv"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-accent" />
                    <div>
                      <p className="font-medium">{t("contact.info.hours")}</p>
                      <p className="text-muted-foreground">
                        {language === "he" ? "א׳-ה׳: 08:00-17:00" : "Sun-Thu: 08:00-17:00"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-all" style={{ animationDelay: "200ms" }}>
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold mb-4">{t("contact.bank.title")}</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t("contact.bank.name")}:</span> Bank Leumi</p>
                  <p><span className="text-muted-foreground">{t("contact.bank.branch")}:</span> 123</p>
                  <p><span className="text-muted-foreground">{t("contact.bank.account")}:</span> 456789</p>
                  <p><span className="text-muted-foreground">{t("contact.bank.holder")}:</span> Global Electric Ltd</p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-all" style={{ animationDelay: "300ms" }}>
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-4 justify-center">
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary hover:bg-accent hover:text-white hover:scale-110 flex items-center justify-center transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary hover:bg-accent hover:text-white hover:scale-110 flex items-center justify-center transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary hover:bg-accent hover:text-white hover:scale-110 flex items-center justify-center transition-all">
                    <Linkedin size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-secondary hover:bg-accent hover:text-white hover:scale-110 flex items-center justify-center transition-all">
                    <Youtube size={20} />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <Card>
          <CardContent className="p-0">
            <div className="h-96 bg-secondary rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.8296739569724!2d34.78057831516893!3d32.06494098119056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDAzJzUzLjgiTiAzNMKwNDYnNTcuNiJF!5e0!3m2!1sen!2sil!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
