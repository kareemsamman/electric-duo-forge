import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = () => {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/972525080994", "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 end-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 mb-2 me-2"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} />
    </button>
  );
};

export default FloatingWhatsApp;
