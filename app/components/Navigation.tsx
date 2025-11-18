import { useState } from "react";
import { Link } from "react-router";
import { AuthModal } from "./auth";
import { Button } from "./ui/button";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navigation = [
    { name: "홈", href: "/" },
    { name: "여행 계획", href: "/flags" },
    { name: "오퍼", href: "/offers" },
    { name: "매치", href: "/matches" },
    { name: "프로필", href: "/profile" },
  ];

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
              {/* Login/Signup buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    console.log("Login button clicked");
                    setIsAuthModalOpen(true);
                  }}
                  variant="default"
                  size="sm"
                >
                  로그인
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/logout">로그아웃</Link>
                </Button>
                <Button
                  onClick={() => {
                    console.log("Signup button clicked");
                    setIsAuthModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  회원가입
                </Button>
              </div>

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

                {/* Mobile auth buttons */}
                <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    로그인 / 회원가입
                  </button>
                  <Link
                    to="/logout"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    로그아웃
                  </Link>
                </div>
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
