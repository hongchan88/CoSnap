import type { Route } from './+types/auth.callback';
import { redirect } from 'react-router';
import { createSupabaseClient } from '../lib/supabase';

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const supabase = createSupabaseClient(request);

  // 오류가 있는 경우
  if (error) {
    return redirect('/?error=auth_error');
  }

  // 인증 코드가 있는 경우
  if (code) {
    try {
      const { data, error } = await supabase.client.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('인증 코드 교환 오류:', error);
        return redirect('/?error=auth_exchange_error');
      }

      if (data.user) {
        // 사용자 프로필 확인 및 생성
        const { data: existingProfile } = await supabase.client
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!existingProfile && data.user.user_metadata) {
          // 프로필 생성
          await supabase.client
            .from('profiles')
            .insert({
              user_id: data.user.id,
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
      return redirect('/?error=auth_callback_error');
    }
  }

  return redirect('/');
}

export default function AuthCallback() {
  // 이 컴포넌트는 렌더링되지 않음 (리디렉션만 발생)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}