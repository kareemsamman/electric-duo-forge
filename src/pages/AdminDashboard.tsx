import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Truck, FolderKanban, Image, Users, LogOut, Settings, Mail } from 'lucide-react';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminSections = [
    {
      title: language === 'he' ? 'מוצרים' : 'Products',
      description: language === 'he' ? 'ניהול קטלוג המוצרים' : 'Manage product catalog',
      icon: Package,
      path: '/admin/products',
      color: 'text-blue-500',
    },
    {
      title: language === 'he' ? 'הזמנות' : 'Orders',
      description: language === 'he' ? 'צפייה וניהול הזמנות' : 'View and manage orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: 'text-green-500',
    },
    {
      title: language === 'he' ? 'משלוחים' : 'Shipping',
      description: language === 'he' ? 'ניהול שיטות משלוח' : 'Manage shipping methods',
      icon: Truck,
      path: '/admin/shipping',
      color: 'text-purple-500',
    },
    {
      title: language === 'he' ? 'פרויקטים' : 'Projects',
      description: language === 'he' ? 'ניהול תיק העבודות' : 'Manage project portfolio',
      icon: FolderKanban,
      path: '/admin/projects',
      color: 'text-orange-500',
    },
    {
      title: language === 'he' ? 'לוגואים' : 'Logos',
      description: language === 'he' ? 'ניהול לוגואי לקוחות' : 'Manage client logos',
      icon: Image,
      path: '/admin/logos',
      color: 'text-pink-500',
    },
    {
      title: language === 'he' ? 'תוכן אתר' : 'Content',
      description: language === 'he' ? 'עריכת תוכן האתר' : 'Edit site content',
      icon: Users,
      path: '/admin/content',
      color: 'text-cyan-500',
    },
    {
      title: language === 'he' ? 'הגדרות' : 'Settings',
      description: language === 'he' ? 'הגדרות אימייל ו-API' : 'Email and API settings',
      icon: Settings,
      path: '/admin/settings',
      color: 'text-gray-500',
    },
    {
      title: language === 'he' ? 'פניות לפרויקטים' : 'Project Inquiries',
      description: language === 'he' ? 'צפייה וניהול פניות ליצירת קשר' : 'View and manage contact inquiries',
      icon: Mail,
      path: '/admin/inquiries',
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {language === 'he' ? 'לוח בקרה' : 'Admin Dashboard'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'he' ? `שלום ${user?.email || ''}` : `Welcome back, ${user?.email || ''}`}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'he' ? 'התנתק' : 'Sign Out'}
          </Button>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {adminSections.map((section, index) => (
            <Card
              key={section.path}
              className="group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden relative"
              onClick={() => navigate(section.path)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 ${section.color}`}>
                    <section.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span className="font-medium">{language === 'he' ? 'פתח' : 'Open'}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card className="bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {language === 'he' ? 'קישורים מהירים' : 'Quick Links'}
            </CardTitle>
            <CardDescription>
              {language === 'he' ? 'גישה מהירה לאזורים נפוצים' : 'Quick access to common areas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {language === 'he' ? 'צפה באתר' : 'View Website'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/store')}
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {language === 'he' ? 'חנות' : 'Store'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/projects')}
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {language === 'he' ? 'פרויקטים' : 'Projects'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
