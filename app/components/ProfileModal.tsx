import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    username: string;
    avatar_url?: string;
    focus_score: number;
    focus_tier: string;
    camera_gear?: string;
    languages?: string[];
    bio?: string;
    is_verified: boolean;
  };
  userFlags?: Array<{
    id: string;
    city: string;
    country: string;
    start_date: string;
    end_date: string;
    note?: string;
    styles?: string[];
    source_policy_type: "free" | "premium";
    visibility_status?: "active" | "hidden" | "expired";
  }>;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  userFlags = [],
}: ProfileModalProps) {
  const getFocusTierColor = (tier: string) => {
    switch (tier) {
      case "Crystal":
        return "bg-gradient-to-r from-blue-400 to-purple-400 text-white";
      case "Clear":
        return "bg-gradient-to-r from-green-400 to-blue-400 text-white";
      case "Focusing":
        return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };


  const getFocusTierEmoji = (tier: string) => {
    switch (tier) {
      case "Crystal":
        return "💎";
      case "Clear":
        return "✨";
      case "Focusing":
        return "🎯";
      default:
        return "🌫️";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            프로필 정보
            {profile.is_verified && <span className="text-blue-500">✓</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {profile.username}
              </h3>
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getFocusTierColor(profile.focus_tier)}`}
              >
                <span>{getFocusTierEmoji(profile.focus_tier)}</span>
                <span>
                  {profile.focus_tier} ({profile.focus_score})
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            {profile.bio && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  소개
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.camera_gear && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  카메라 장비
                </h4>
                <p className="text-sm text-gray-600">{profile.camera_gear}</p>
              </div>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  언어
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Focus 점수
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getFocusTierColor(profile.focus_tier)}`}
                  style={{
                    width: `${Math.min((profile.focus_score / 100) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                현재 점수: {profile.focus_score}점
              </p>
            </div>
          </div>

          {/* Flag History */}
          {userFlags && userFlags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                여행 플래그 기록 ({userFlags.length}개)
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userFlags
                  .sort(
                    (a, b) =>
                      new Date(b.start_date).getTime() -
                      new Date(a.start_date).getTime()
                  )
                  .slice(0, 10)
                  .map((flag) => {
                    const isExpired = new Date(flag.end_date) < new Date();
                    const isUpcoming = new Date(flag.start_date) > new Date();
                    const isCurrent = !isExpired && !isUpcoming;

                    // Get status based on visibility_status or date logic
                    const getStatus = () => {
                      if (flag.visibility_status) {
                        switch (flag.visibility_status) {
                          case "active":
                            return isCurrent ? "진행중" : isUpcoming ? "예정" : "만료됨";
                          case "hidden":
                            return "숨김";
                          case "expired":
                            return "만료됨";
                          default:
                            return "알 수 없음";
                        }
                      }
                      return isCurrent ? "진행중" : isUpcoming ? "예정" : "완료";
                    };

                    const getStatusColor = () => {
                      if (flag.visibility_status) {
                        switch (flag.visibility_status) {
                          case "active":
                            return isCurrent ? "bg-green-100 text-green-700" : isUpcoming ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
                          case "hidden":
                            return "bg-yellow-100 text-yellow-700";
                          case "expired":
                            return "bg-red-100 text-red-700";
                          default:
                            return "bg-gray-100 text-gray-700";
                        }
                      }
                      return isCurrent ? "bg-green-100 text-green-700" : isUpcoming ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
                    };

                    return (
                      <div
                        key={flag.id}
                        className={`p-3 rounded-lg border ${
                          isCurrent
                            ? "border-green-200 bg-green-50"
                            : isExpired
                              ? "border-gray-200 bg-gray-50"
                              : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {flag.city}, {flag.country}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {new Date(flag.start_date).toLocaleDateString(
                                "ko-KR"
                              )}{" "}
                              -{" "}
                              {new Date(flag.end_date).toLocaleDateString(
                                "ko-KR"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                flag.source_policy_type === "premium"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {flag.source_policy_type === "premium"
                                ? "프리미엄"
                                : "무료"}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
                              {getStatus()}
                            </span>
                          </div>
                        </div>

                        {flag.note && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {flag.note}
                          </p>
                        )}

                        {flag.styles && flag.styles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {flag.styles.slice(0, 3).map((style, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                              >
                                {style}
                              </span>
                            ))}
                            {flag.styles.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{flag.styles.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {userFlags.length > 10 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">
                      최근 10개의 플래그만 표시됩니다 (총 {userFlags.length}개)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={onClose} className="flex-1">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
