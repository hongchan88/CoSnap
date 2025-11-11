import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthModal } from './auth';
import { Button } from './ui/button';
import { getCurrentUser, getUserProfile } from '../context/auth-context';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const { profile: userProfile } = await getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const navigation = [
    { name: '홈', href: '/' },
    { name: '여행 계획', href: '/flags' },
    { name: '오퍼', href: '/offers' },
    { name: '매치', href: '/matches' },
    { name: '프로필', href: '/profile' },
  ];

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('../context/auth-context');
      const { error } = await signOut();

      if (error) {
        console.error('로그아웃 오류:', error);
      } else {
        setUser(null);
        setProfile(null);
        navigate('/');
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const getFocusTierColor = (tier: string) => {
    switch (tier) {
      case 'Crystal':
        return 'text-purple-600';
      case 'Clear':
        return 'text-blue-600';
      case 'Focusing':
        return 'text-green-600';
      case 'Blurry':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <span className="text-xl font-bold text-blue-600">CoSnap</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {!loading && user ? (
                /* 인증된 사용자 */
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.username || 'User'}
                        </p>
                        <p
                          className={`text-xs font-medium ${getFocusTierColor(profile?.focus_tier || 'Blurry')}`}
                        >
                          {profile?.focus_tier || 'Blurry'} •{' '}
                          {profile?.focus_score || 0}점
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      로그아웃
                    </Button>
                  </div>

                  {/* Mobile user info */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {profile?.username || 'User'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* 비인증 사용자 */
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      console.log('Login button clicked');
                      setIsAuthModalOpen(true);
                    }}
                    variant="default"
                    size="sm"
                  >
                    {loading ? '로딩 중...test11' : '로그인'}
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Signup button clicked');
                      setIsAuthModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? '로딩 중...' : '회원가입'}
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMobileMenuOpen ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </Link>
                ))}

                {user && (
                  <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.username || 'User'}
                      </p>
                      <p
                        className={`text-xs font-medium ${getFocusTierColor(profile?.focus_tier || 'Blurry')}`}
                      >
                        {profile?.focus_tier || 'Blurry'} •{' '}
                        {profile?.focus_score || 0}점
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      로그아웃
                    </button>
                  </div>
                )}

                {!user && (
                  <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      {loading ? '확인 중...' : '로그인 / 회원가입'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
