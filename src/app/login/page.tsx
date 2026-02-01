"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const { login, signup, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Redirect if already logged in - moved to useEffect to avoid render-time redirect
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔐 Frontend: Login form submitted');
    console.log('📧 Frontend: Email:', signInEmail);
    console.log('🔑 Frontend: Password length:', signInPassword?.length || 0);

    if (!signInEmail || !signInPassword) {
      console.log('❌ Frontend: Missing fields');
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password.",
      });
      return;
    }

    setSignInLoading(true);
    try {
      console.log('📤 Frontend: Calling login API...');
      const result = await login(signInEmail, signInPassword);
      console.log('📥 Frontend: Login API response:', result);

      if (result.success) {
        console.log('✅ Frontend: Login successful');
        toast({
          title: "Success!",
          description: "Logged in successfully.",
        });
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      } else {
        console.log('❌ Frontend: Login failed:', result.error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.error || "Invalid email or password.",
        });
      }
    } catch (error) {
      console.error('❌ Frontend: Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setSignUpLoading(true);
    try {
      const result = await signup(signUpName, signUpEmail, signUpPassword);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Account created successfully. Please complete your emergency details.",
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: result.error || "Failed to create account.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <Logo className="h-14" />
      </div>
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-headline">Sign in to your account</CardTitle>
              <CardDescription>Access your health dashboard.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={signInLoading}>
                  {signInLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-headline">Create your account</CardTitle>
              <CardDescription>Start your health journey with us.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={signUpLoading}>
                  {signUpLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
