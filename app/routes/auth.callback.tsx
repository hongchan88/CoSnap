import type { Route } from './+types/auth.callback';
import { redirect } from 'react-router';
import { createSupabaseClient } from '../lib/supabase';
import { useLanguage } from '~/context/language-context';

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const supabase = createSupabaseClient(request);

  // 오류가 있는 경우
  if (error) {
    return redirect('/login?error=auth_error', { headers: supabase.headers });
  }

  // 인증 코드가 있는 경우
  if (code) {
    try {
      const { data, error } = await supabase.client.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('인증 코드 교환 오류:', error);
        return redirect('/login?error=auth_exchange_error', { headers: supabase.headers });
      }

      if (data.user) {
        // 사용자 프로필 확인 및 생성
        const { data: existingProfile } = await supabase.client
          .from('profiles')
          .select('*')
          .eq('profile_id', data.user.id)
          .single();

        if (!existingProfile && data.user.user_metadata) {
          // 프로필 생성
          await supabase.client
            .from('profiles')
            .insert({
              profile_id: data.user.id,
              username: data.user.user_metadata.full_name ||
                       data.user.user_metadata.name ||
                       data.user.email?.split('@')[0] || 'User',
              role: 'free',
              focus_score: 0,
              focus_tier: 'Blurry',
              cocredit_balance: 0,
              styles: [],
              languages: [],
              is_verified: false,
            });
        }
      }
    } catch (error) {
      console.error('OAuth 콜백 처리 중 오류:', error);
      return redirect('/login?error=auth_callback_error', { headers: supabase.headers });
    }
  }

  return redirect('/', { headers: supabase.headers });
}

export default function AuthCallback() {
  const { t } = useLanguage();
  // 이 컴포넌트는 렌더링되지 않음 (리디렉션만 발생)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t("auth.processing")}</h2>
        <p className="text-gray-600">{t("auth.pleaseWait")}</p>
      </div>
    </div>
  );
}
