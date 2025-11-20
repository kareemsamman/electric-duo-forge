import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Truck, FolderKanban, Image, Users, LogOut, Settings } from 'lucide-react';

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
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {language === 'he' ? 'לוח בקרה' : 'Admin Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'he' ? `שלום ${user?.email || ''}` : `Hello ${user?.email || ''}`}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'he' ? 'התנתק' : 'Sign Out'}
          </Button>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card
              key={section.path}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(section.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted ${section.color}`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription className="mt-1">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  {language === 'he' ? 'פתח' : 'Open'} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-background rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'he' ? 'קישורים מהירים' : 'Quick Links'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              {language === 'he' ? 'צפה באתר' : 'View Website'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/store')}>
              {language === 'he' ? 'חנות' : 'Store'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
