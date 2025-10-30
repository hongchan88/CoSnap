import type { Route } from "./+types/offers";
import { useState } from "react";
import OfferModal from "../components/OfferModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Notification from "../components/ui/Notification";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Mail, CheckCircle, XCircle, Calendar, User } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "오퍼 - CoSnap" },
    { name: "description", content: "받은 오퍼와 보낸 오퍼를 관리하세요" },
  ];
}

interface OfferData {
  message: string;
  preferredDates: string[];
  photoStyles: string[];
  location: string;
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 실시간 오퍼 목록 (시뮬레이션)
  const [receivedOffers, setReceivedOffers] = useState([
    {
      id: '1',
      senderName: '김민준',
      focusScore: 85,
      focusTier: 'Crystal',
      destination: '도쿄, 오사카',
      startDate: '2024-11-15',
      endDate: '2024-11-25',
      message: '안녕하세요! 같은 기간에 일본 여행을 계획하고 있습니다. 신주쿠와 시부야에서 멋진 스냅 사진 함께 찍을까요? 저는 풍경 사진에 자신있습니다!',
      status: 'pending',
      isNew: true,
    },
    {
      id: '2',
      senderName: '이서아',
      focusScore: 65,
      focusTier: 'Clear',
      destination: '도쿄, 오사카',
      startDate: '2024-11-15',
      endDate: '2024-11-25',
      message: '안녕하세요! 오사카 성과 도톤보리에서 멋진 사진 찍어드릴게요. 밤 사진 전문이라 야경 촬영 도와드릴 수 있어요!',
      status: 'pending',
      isNew: false,
    },
    {
      id: '3',
      senderName: '박철민',
      focusScore: 35,
      focusTier: 'Focusing',
      destination: '서울, 부산',
      startDate: '2024-12-01',
      endDate: '2024-12-07',
      message: '12월 3일 오후 2시, 명동역에서 만나기로 한 오퍼입니다.',
      status: 'accepted',
      isNew: false,
    },
  ]);

  const [sentOffers, setSentOffers] = useState([
    {
      id: '4',
      receiverName: '최지혜',
      destination: '파리, 니스',
      startDate: '2024-10-20',
      endDate: '2024-10-27',
      status: 'pending',
    },
    {
      id: '5',
      receiverName: '이현우',
      destination: '로마, 피렌체',
      startDate: '2024-09-15',
      endDate: '2024-09-22',
      status: 'declined',
    },
  ]);

  const handleSendOffer = async (offerData: OfferData) => {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 성공 처리
    const newOffer = {
      id: Date.now().toString(),
      receiverName: '새로운 사용자',
      destination: selectedFlag?.destination || '',
      startDate: selectedFlag?.startDate || '',
      endDate: selectedFlag?.endDate || '',
      status: 'pending',
    };

    setSentOffers(prev => [newOffer, ...prev]);
  };

  const handleAcceptOffer = async (offerId: string) => {
    setIsAccepting(offerId);

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReceivedOffers(prev =>
        prev.map(offer =>
          offer.id === offerId
            ? { ...offer, status: 'accepted' as const }
            : offer
        )
      );

      setNotification({ type: 'success', message: '오퍼를 수락했습니다! 매치 페이지에서 확인하세요.' });
    } catch (error) {
      setNotification({ type: 'error', message: '오퍼 수락에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    setIsDeclining(offerId);

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      setReceivedOffers(prev =>
        prev.map(offer =>
          offer.id === offerId
            ? { ...offer, status: 'declined' as const }
            : offer
        )
      );

      setNotification({ type: 'success', message: '오퍼를 거절했습니다.' });
    } catch (error) {
      setNotification({ type: 'error', message: '오퍼 거절에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsDeclining(null);
    }
  };

  const openOfferModal = () => {
    // 실제로는 검색 페이지나 Flag 목록에서 선택
    setSelectedFlag({
      id: 'sample-flag',
      destination: '파리, 니스',
      country: '프랑스',
      startDate: '2024-12-15',
      endDate: '2024-12-22',
      ownerName: '새로운 사용자',
    });
    setIsOfferModalOpen(true);
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '응답 대기';
      case 'accepted': return '수락됨';
      case 'declined': return '거절됨';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">오퍼</h1>
          <p className="text-gray-600">여행자들과의 교류를 시작하세요</p>
        </div>

        {/* 알림 */}
        {notification && (
          <div className="mb-6">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
              autoClose={true}
            />
          </div>
        )}

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'received' | 'sent')} className="mb-6">
          <TabsList>
            <TabsTrigger value="received" className="text-base">
              받은 오퍼 <Badge variant="secondary" className="ml-2">{receivedOffers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-base">
              보낸 오퍼 <Badge variant="secondary" className="ml-2">{sentOffers.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* 오퍼 목록 */}
          <TabsContent value="received" className="space-y-4">
          {receivedOffers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mail className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">받은 오퍼가 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">Flag에 오퍼가 오면 여기에 표시됩니다</p>
              </CardContent>
            </Card>
          ) : (
            receivedOffers.map((offer) => (
              <Card key={offer.id} className={`border-l-4 ${
                offer.isNew ? 'border-blue-500' :
                offer.status === 'accepted' ? 'border-green-500' :
                offer.status === 'declined' ? 'border-red-500' : 'border-gray-300'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{offer.senderName}</h3>
                        <p className="text-sm text-gray-500">Focus: {offer.focusTier} ({offer.focusScore}점)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.isNew && (
                        <Badge variant="default" className="text-xs">새 오퍼</Badge>
                      )}
                      <Badge variant={offer.status === 'accepted' ? 'default' : offer.status === 'declined' ? 'destructive' : 'secondary'}>
                        {getOfferStatusText(offer.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🇯🇵 {offer.destination}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(offer.startDate).toLocaleDateString('ko-KR')} - {new Date(offer.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {offer.message}
                    </p>
                  </div>

                  {offer.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      매치가 성사되었습니다! <span className="text-sm">매치 페이지에서 확인하세요</span>
                    </div>
                  )}
                  {offer.status === 'declined' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg">
                      <XCircle className="w-5 h-5 inline mr-2" />
                      오퍼가 거절되었습니다
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {offer.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={isAccepting === offer.id}
                          className="flex-1"
                        >
                          {isAccepting === offer.id ? (
                            <>
                              <LoadingSpinner size="sm" color="white" />
                              수락 중...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              수락하기
                            </>
                            )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeclineOffer(offer.id)}
                          disabled={isDeclining === offer.id}
                          className="flex-1"
                        >
                          {isDeclining === offer.id ? (
                            <>
                              <LoadingSpinner size="sm" />
                              거절 중...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              거절하기
                            </>
                            )}
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                      프로필 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {/* 오퍼 보내기 버튼 */}
          <div className="mb-6">
            <Button onClick={openOfferModal} className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              새 오퍼 보내기
            </Button>
          </div>
          {sentOffers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mail className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">보낸 오퍼가 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">새 오퍼를 보내서 새로운 사람들을 만나보세요</p>
              </CardContent>
            </Card>
          ) : (
            sentOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{offer.receiverName}에게 보낸 오퍼</h3>
                        <p className="text-sm text-gray-500">📍 {offer.destination}</p>
                      </div>
                    </div>
                    <Badge variant={offer.status === 'accepted' ? 'default' : offer.status === 'declined' ? 'destructive' : 'secondary'}>
                      {getOfferStatusText(offer.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(offer.startDate).toLocaleDateString('ko-KR')} - {new Date(offer.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800 text-sm">
                      오퍼 내용 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        </Tabs>

        {/* 프리미엄 오퍼 제한 안내 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">프리미엄 오퍼 제한</h3>
              <p className="text-gray-700 text-sm">
                무료 사용자는 주당 3개의 오퍼만 보낼 수 있습니다.
                프리미엄으로 업그레이드하여 무제한 오퍼를 보내세요.
              </p>
              <Button variant="ghost" className="mt-3 text-yellow-700 hover:text-yellow-800 font-medium text-sm p-0 h-auto">
                프리미엄 알아보기 →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 오퍼 보내기 모달 */}
      {selectedFlag && (
        <OfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          flagData={selectedFlag}
          onSubmit={handleSendOffer}
        />
      )}
    </div>
  );
}