import React, { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { signInWithGoogle } from '../context/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from '~/context/language-context';
import { getAuthErrorKey, validateAuthForm, type AuthErrorKey } from '~/lib/auth-translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { language, t } = useLanguage();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginFetcher = useFetcher();
  const signupFetcher = useFetcher();
  
  const [error, setError] = useState<AuthErrorKey | null>(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Handle Login Success/Error
  useEffect(() => {
    if (loginFetcher.data?.success) {
      onClose();
      window.location.reload(); // Reload to update UI with new session
    } else if (loginFetcher.data?.errorKey) {
      setError(loginFetcher.data.errorKey);
    }
  }, [loginFetcher.data, onClose]);

  // Handle Signup Success/Error
  useEffect(() => {
    if (signupFetcher.data?.success) {
      onClose();
      window.location.reload(); // Reload to update UI with new session
    } else if (signupFetcher.data?.errorKey) {
      setError(signupFetcher.data.errorKey);
    }
  }, [signupFetcher.data, onClose]);

  // 회원가입 폼 상태
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  // 로그인 폼 상태
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const form = new FormData();
    Object.entries({ ...signUpData, language }).forEach(([key, value]) => form.set(key, value));
    const result = validateAuthForm(form, "signup");
    if (result.errorKey) { setError(result.errorKey); return; }
    signupFetcher.submit(form, { method: "post", action: "/signup" });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginFetcher.submit({ ...signInData, language }, { method: "post", action: "/login" });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setError(getAuthErrorKey(error, "google"));
    } catch (error) {
      setError(getAuthErrorKey(error, "google"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isGoogleLoading || loginFetcher.state === "submitting" || signupFetcher.state === "submitting";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {t("auth.welcome")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="signin" className="space-y-4">
            <form noValidate onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">{t("auth.email")}</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">{t("auth.password")}</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{t(error)}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {t(isLoading ? "auth.loggingIn" : "auth.login")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t(isGoogleLoading ? "auth.googleLoading" : "auth.googleLogin")}
            </Button>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup" className="space-y-4">
            <form noValidate onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">{t("auth.username")}</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder={t("auth.usernamePlaceholder")}
                  value={signUpData.username}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">{t("auth.email")}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">{t("auth.password")}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder={t("auth.newPasswordPlaceholder")}
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">{t("auth.confirmPassword")}</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder={t("auth.confirmPlaceholder")}
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{t(error)}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {t(isLoading ? "auth.signingUp" : "auth.signup")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t(isGoogleLoading ? "auth.googleLoading" : "auth.googleSignup")}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}