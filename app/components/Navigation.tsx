import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "~/context/language-context";
import LanguageToggle from "./LanguageToggle.client";
import { ChevronDown } from "lucide-react";
import { NotificationBell } from "./notifications/NotificationBell";

interface NavigationProps {
  user: User | null;
}

export default function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageDropdownOpen, setIsMobileLanguageDropdownOpen] =
    useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: t ? t("nav.home") : "홈", href: "/" },
    { name: t ? t("nav.explore") : "여행자 찾기", href: "/explore" },
    { name: t ? t("nav.flags") : "여행 계획", href: "/flags" },
    { name: t ? t("nav.inbox") : "인박스", href: "/inbox" },
    { name: t ? t("nav.profile") : "프로필", href: "/profile" },
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
              {/* Notifications */}
              {user && <NotificationBell userId={user.id} />}

              {/* Language Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                  className="flex items-center gap-2"
                >
                  {language === "ko" ? `🇰🇷 ${t("lang.korean")}` : `🇺🇸 ${t("lang.english")}`}
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      onClick={() => {
                        setLanguage("ko");
                        setIsLanguageDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      🇰🇷 {t("lang.korean")}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsLanguageDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      🇺🇸 {t("lang.english")}
                    </button>
                  </div>
                )}
              </div>

              {/* Login/Signup buttons */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/logout" reloadDocument>
                      {t ? t("nav.logout") : "로그아웃"}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="default" size="sm">
                      <Link to="/login">{t ? t("nav.login") : "로그인"}</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/signup">
                        {t ? t("nav.signup") : "회원가입"}
                      </Link>
                    </Button>
                  </>
                )}
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
                  {/* Mobile language dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsMobileLanguageDropdownOpen(
                          !isMobileLanguageDropdownOpen
                        )
                      }
                      className="w-full text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
                    >
                      <span>
                        {language === "ko" ? `🇰🇷 ${t("lang.korean")}` : `🇺🇸 ${t("lang.english")}`}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Mobile Dropdown Menu */}
                    {isMobileLanguageDropdownOpen && (
                      <div className="w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <button
                          onClick={() => {
                            setLanguage("ko");
                            setIsMobileLanguageDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          🇰🇷 {t("lang.korean")}
                        </button>
                        <button
                          onClick={() => {
                            setLanguage("en");
                            setIsMobileLanguageDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          🇺🇸 {t("lang.english")}
                        </button>
                      </div>
                    )}
                  </div>

                  {user ? (
                    <Link
                      to="/logout"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
                    >
                      {t ? t("nav.logout") : "로그아웃"}
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
                      >
                        {t ? t("nav.login") : "로그인"}
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium"
                      >
                        {t ? t("nav.signup") : "회원가입"}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
