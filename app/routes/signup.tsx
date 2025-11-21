import type { Route } from "./+types/signup";
import { useState } from "react";
import { redirect } from "react-router";
import { useActionData, Form, useNavigation } from "react-router";
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
import { sendWelcomeEmail } from "../lib/resend";
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const username = formData.get("username") as string;

  // 유효성 검사
  if (!email || !password || !confirmPassword || !username) {
    return { error: "모든 필드를 입력해주세요." };
  }

  if (password !== confirmPassword) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  if (password.length < 6) {
    return { error: "비밀번호는 최소 6자 이상이어야 합니다." };
  }

  try {
    const supabase = createSupabaseClient(request);
    const { data, error } = await supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      },
    });
    console.log(data, "data ");
    if (error) {
      return { error: error.message || "회원가입에 실패했습니다." };
    }

    await sendWelcomeEmail(email, username);

    // 회원가입 성공 시 로그인 페이지로 리디렉션 (환영 이메일 발송됨)
    return redirect("/login?message=signup_success");
  } catch (error) {
    return { error: "회원가입 중 오류가 발생했습니다." };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "회원가입 - CoSnap" },
    {
      name: "description",
      content: "CoSnap에 가입하여 전 세계 여행자들과 사진을 교환하세요.",
    },
  ];
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const controlsDisabled = isSubmitting || isGoogleLoading;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google 가입 오류:", error);
      }
    } catch (error) {
      console.error("Google 가입 오류:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            CoSnap에 가입하여 새로운 여행 친구들을 만나보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">사용자 이름</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="사용자 이름을 입력하세요"
                required
                disabled={controlsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                required
                disabled={controlsDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호 (최소 6자)"
                required
                disabled={controlsDisabled}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                required
                disabled={controlsDisabled}
                minLength={6}
              />
            </div>

            {actionData?.error && (
              <Alert variant="destructive">
                <AlertDescription>{actionData.error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={controlsDisabled}
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </Button>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
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
            {isGoogleLoading ? "Google로 가입 중..." : "Google로 가입"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
