import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: language === 'he' ? 'התחברת בהצלחה' : 'Login successful',
        description: language === 'he' ? 'ברוך הבא!' : 'Welcome!',
      });
      navigate('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'he' ? 'שגיאה בהתחברות' : 'Login error',
        description: error.message || (language === 'he' ? 'אימייל או סיסמה שגויים' : 'Invalid email or password'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-lg p-8 border">
          <h1 className="text-3xl font-bold text-center mb-2">
            {language === 'he' ? 'התחברות למערכת' : 'Admin Login'}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {language === 'he' ? 'הזן את פרטי ההתחברות שלך' : 'Enter your credentials'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'he' ? 'אימייל' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'he' ? 'your@email.com' : 'your@email.com'}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'he' ? 'סיסמה' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'he' ? '••••••••' : '••••••••'}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading
                ? (language === 'he' ? 'מתחבר...' : 'Logging in...')
                : (language === 'he' ? 'התחבר' : 'Login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-primary hover:underline">
              {language === 'he' ? '← חזור לאתר' : '← Back to website'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
