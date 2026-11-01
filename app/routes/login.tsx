import type { Route } from "./+types/login";
import { useState } from "react";
import { redirect } from "react-router";
import { useActionData, Form, useNavigation, useSearchParams } from "react-router";
import { signInWithGoogle } from "../context/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { createSupabaseClient } from "../lib/supabase";
import { useLanguage } from "~/context/language-context";
import { validateAuthForm, getAuthErrorKey, type AuthErrorKey } from "~/lib/auth-translations";


export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const { language, values, errorKey } = validateAuthForm(formData, "login");
  if (errorKey) return { errorKey, language };
  try {
    const { client, headers } = createSupabaseClient(request);
    const { error } = await client.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) return { errorKey: getAuthErrorKey(error, "login"), language };
    return redirect("/", { headers });
  } catch {
    return { errorKey: "auth.error.login" as AuthErrorKey, language };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Log in - CoSnap" },
    {
      name: "description",
      content: "Log in to CoSnap and connect with fellow travelers.",
    },
  ];
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { language, t } = useLanguage();
  const [query] = useSearchParams();
  const [googleError, setGoogleError] = useState<AuthErrorKey | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const controlsDisabled = isSubmitting || isGoogleLoading;

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setGoogleError(getAuthErrorKey(error, "google"));
      }
    } catch (error) {
      setGoogleError(getAuthErrorKey(error, "google"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("auth.login")}</CardTitle>
          <CardDescription>
            {t("auth.loginDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {query.get("message") === "signup_success" && <Alert><AlertDescription>{t("auth.signupSuccess")}</AlertDescription></Alert>}
          <Form method="post" noValidate className="space-y-4">
            <input type="hidden" name="language" value={language} />
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                required
                disabled={controlsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                required
                disabled={controlsDisabled}
              />
            </div>

            {(actionData?.errorKey || googleError || query.has("error")) && (
              <Alert variant="destructive">
                <AlertDescription>{t(actionData?.errorKey || googleError || "auth.error.callback")}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={controlsDisabled}
            >
              {t(isSubmitting ? "auth.loggingIn" : "auth.login")}
            </Button>
          </Form>

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
            disabled={controlsDisabled}
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

          <div className="text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.signup")}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
