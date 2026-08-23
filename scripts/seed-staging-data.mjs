const ids = {
  mina: "a1111111-1111-4111-8111-111111111111",
  joon: "a2222222-2222-4222-8222-222222222222",
  yuna: "a3333333-3333-4333-8333-333333333333",
  alex: "a4444444-4444-4444-8444-444444444444",
  maya: "a5555555-5555-4555-8555-555555555555",
  lucas: "a6666666-6666-4666-8666-666666666666",
};

const dateAfter = (now, days, hour = 10) => new Date(now.getTime() + (days * 24 + hour) * 60 * 60 * 1000);

export function createSeedData(now = new Date()) {
  const users = [
    ["mina", "Mina Kim", "mina.kim.demo@cosnap.staging"],
    ["joon", "Joon Park", "joon.park.demo@cosnap.staging"],
    ["yuna", "Yuna Lee", "yuna.lee.demo@cosnap.staging"],
    ["alex", "Alex Chen", "alex.chen.demo@cosnap.staging"],
    ["maya", "Maya Santos", "maya.santos.demo@cosnap.staging"],
    ["lucas", "Lucas Martin", "lucas.martin.demo@cosnap.staging"],
  ].map(([key, username, email]) => ({ id: ids[key], username, email }));

  const profiles = [
    ["mina", "Mina Kim", "Fujifilm X-T5", ["street", "portrait"], ["Korean", "English"], "Seoul local. Happy to trade portraits and hidden cafe tips.", "photo-1494790108377-be9c29b29330", 92, "Crystal", true],
    ["joon", "Joon Park", "Sony A7 IV", ["film", "night"], ["Korean", "Japanese", "English"], "Night photography and quiet city walks.", "photo-1500648767791-00dcc994a43e", 84, "Clear", true],
    ["yuna", "Yuna Lee", "Ricoh GR III", ["food", "street"], ["Korean", "English"], "Solo traveler collecting food stories one market at a time.", "photo-1534528741775-53994a69daeb", 76, "Clear", false],
    ["alex", "Alex Chen", "Canon R6 Mark II", ["landscape", "portrait"], ["English", "Mandarin", "Japanese"], "Tokyo-based photographer. Sunrise shoots welcome.", "photo-1506794778202-cad84cf45f1d", 88, "Crystal", true],
    ["maya", "Maya Santos", "Sony ZV-E10", ["travel", "video"], ["English", "Tagalog", "Thai"], "Remote worker exploring Southeast Asia with camera in hand.", "photo-1544005313-94ddf0286df2", 68, "Focusing", false],
    ["lucas", "Lucas Martin", "Leica Q3", ["architecture", "street"], ["English", "French", "Portuguese"], "Lisbon local sharing photo walks and pastel de nata.", "photo-1519085360753-af0119f7cbe7", 81, "Clear", true],
  ].map(([key, username, cameraGear, styles, languages, bio, imageId, focusScore, focusTier, isVerified]) => ({
    id: ids[key], username, cameraGear, styles, languages, bio, focusScore, focusTier, isVerified,
    avatarUrl: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=320&q=80`,
  }));

  const flags = [
    ["b1111111-1111-4111-8111-111111111111", "mina", "Seoul", "KR", 37.5665, 126.978, "photo", "Golden-hour portraits at Bukchon", "photo", "Portrait swap near Bukchon Hanok Village. I can share spots after.", 3, 3],
    ["b2222222-2222-4222-8222-222222222222", "joon", "Seoul", "KR", 37.5512, 126.9882, "meet", "Namsan night photo walk", "sightseeing", "Tripod-friendly night walk. Beginners welcome.", 5, 2],
    ["b3333333-3333-4333-8333-333333333333", "alex", "Tokyo", "JP", 35.6762, 139.6503, "photo", "Asakusa morning photo exchange", "photo", "Looking for one person to swap candid travel photos before crowds arrive.", 4, 2],
    ["b4444444-4444-4444-8444-444444444444", "yuna", "Bangkok", "TH", 13.7563, 100.5018, "meet", "Chinatown food crawl", "food_tour", "Three stalls, great light, and no rushed itinerary.", 7, 2],
    ["b5555555-5555-4555-8555-555555555555", "lucas", "Lisbon", "PT", 38.7223, -9.1393, "offer", "Lisbon architecture photo walk", "other", "Can guide a small group through Alfama viewpoints for photo practice.", 9, 3],
    ["b6666666-6666-4666-8666-666666666666", "maya", "New York", "US", 40.7128, -74.006, "meet", "Central Park weekend portraits", "photo", "Casual portrait exchange around Bethesda Terrace.", 11, 2],
    ["b7777777-7777-4777-8777-777777777777", "alex", "Tokyo", "JP", 35.7101, 139.8107, "help", "Need local ramen recommendation", "other", "First evening in Tokyo. Seeking low-key ramen near Sumida.", 6, 1],
    ["b8888888-8888-4888-8888-888888888888", "mina", "Seoul", "KR", 37.5704, 126.985, "free", "Free Seoul photo map", "other", "Sharing pinned photo spots from my last three weekend walks.", 8, 4],
  ].map(([id, userKey, city, country, latitude, longitude, type, title, meetupCategory, note, startDays, duration]) => ({
    id, userId: ids[userKey], city, country, latitude, longitude, type, title, meetupCategory, note,
    styles: ["street", "travel"], languages: ["English", "Korean"], startDate: dateAfter(now, startDays), endDate: dateAfter(now, startDays + duration),
  }));

  const posts = [
    ["c1111111-1111-4111-8111-111111111111", "yuna", "help", "Where to print film in Bangkok?", "Looking for a same-day film lab near Chinatown. Happy to share a coffee for help.", null, null, 13.738, 100.511, 2],
    ["c2222222-2222-4222-8222-222222222222", "lucas", "offer", "Alfama sunset photo guide", "Two-hour route through viewpoints and tiled streets. Bring comfortable shoes.", 20, "EUR", 38.711, -9.13, 6],
    ["c3333333-3333-4333-8333-333333333333", "mina", "free", "Spare phone tripod", "Giving away a compact phone tripod near Myeongdong before I leave Seoul.", null, null, 37.5636, 126.9869, 4],
    ["c4444444-4444-4444-8444-444444444444", "maya", "meet", "Coffee and edit session", "Bring laptop or phone. Let's edit travel photos together in Central Park.", null, null, 40.7812, -73.9665, 8],
  ].map(([id, userKey, type, title, description, price, currency, latitude, longitude, expiresDays]) => ({
    id, userId: ids[userKey], type, title, description, price, currency, latitude, longitude, expiresAt: dateAfter(now, expiresDays),
  }));

  const offers = [
    ["d1111111-1111-4111-8111-111111111111", "joon", "mina", flags[0].id, "I know Bukchon well. Want to swap portraits around 5pm?", "accepted"],
    ["d2222222-2222-4222-8222-222222222222", "maya", "lucas", flags[4].id, "Your Alfama route sounds perfect. Can I join with a small camera?", "pending"],
    ["d3333333-3333-4333-8333-333333333333", "yuna", "alex", flags[2].id, "I will be in Tokyo too. Interested in an early Asakusa walk?", "accepted"],
  ].map(([id, senderKey, receiverKey, flagId, message, status]) => ({ id, senderId: ids[senderKey], receiverId: ids[receiverKey], flagId, message, status, sentAt: dateAfter(now, -1) }));

  const conversations = [
    ["e1111111-1111-4111-8111-111111111111", "joon", "mina", offers[0].id],
    ["e2222222-2222-4222-8222-222222222222", "yuna", "alex", offers[2].id],
  ].map(([id, userAKey, userBKey, offerId]) => ({ id, userAId: ids[userAKey], userBId: ids[userBKey], offerId }));

  const messages = [
    ["f1111111-1111-4111-8111-111111111111", conversations[0].id, "joon", "5pm works. I will bring a small reflector.", true, -1],
    ["f2222222-2222-4222-8222-222222222222", conversations[0].id, "mina", "Great, meet at Anguk Station exit 2?", true, -1],
    ["f3333333-3333-4333-8333-333333333333", conversations[0].id, "joon", "Perfect. See you there!", false, 0],
    ["f4444444-4444-4444-8444-444444444444", conversations[1].id, "yuna", "I can meet near the Kaminarimon gate at 7am.", true, -1],
    ["f5555555-5555-4555-8555-555555555555", conversations[1].id, "alex", "Sounds good. Morning light should be beautiful.", true, -1],
    ["f6666666-6666-4666-8666-666666666666", conversations[1].id, "yuna", "See you then!", false, 0],
  ].map(([id, conversationId, senderKey, content, isRead, days]) => ({ id, conversationId, senderId: ids[senderKey], content, isRead, createdAt: dateAfter(now, days) }));

  const matches = [{ id: "11111111-1111-4111-8111-111111111111", offerId: offers[0].id, userAId: ids.joon, userBId: ids.mina, flagId: flags[0].id, scheduledAt: flags[0].startDate, locationHint: "Anguk Station exit 2", status: "scheduled" }];
  const reviews = [{ id: "22222222-2222-4222-8222-222222222222", matchId: matches[0].id, authorId: ids.joon, targetId: ids.mina, rating: 5, comment: "Friendly, punctual, and knew every great photo spot.", photoSampleUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=640&q=80" }];

  return { users, profiles, flags, posts, offers, conversations, messages, matches, reviews };
}
