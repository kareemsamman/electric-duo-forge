import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ContentProvider } from "@/contexts/ContentContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Home from "./pages/Home";
import About from "./pages/About";
import Solutions from "./pages/Solutions";
import Projects from "./pages/Projects";
import Store from "./pages/Store";
import Gallery from "./pages/Gallery";
import Certificates from "./pages/Certificates";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminContent from "./pages/AdminContent";
import AdminLogos from "./pages/AdminLogos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ContentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/store" element={<Store />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/logos" element={<AdminLogos />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <FloatingWhatsApp />
          </div>
          </BrowserRouter>
        </ContentProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
