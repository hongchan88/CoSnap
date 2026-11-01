const ids = {
  mina: "a1111111-1111-4111-8111-111111111111",
  joon: "a2222222-2222-4222-8222-222222222222",
  yuna: "a3333333-3333-4333-8333-333333333333",
  alex: "a4444444-4444-4444-8444-444444444444",
  maya: "a5555555-5555-4555-8555-555555555555",
  lucas: "a6666666-6666-4666-8666-666666666666",
  sora: "a7777777-7777-4777-8777-777777777777",
  theo: "a8888888-8888-4888-8888-888888888888",
  hana: "a9999999-9999-4999-8999-999999999999",
  olivia: "a1010101-1010-4010-8010-101010101010",
  daniel: "a1212121-1212-4212-8212-121212121212",
  clara: "a1313131-1313-4313-8313-131313131313",
};

const dateAfter = (now, days, hour = 10) => new Date(now.getTime() + (days * 24 + hour) * 60 * 60 * 1000);

export function createSeedData(now = new Date(), { userCount = 60, flagCount = 300, postCount = 120 } = {}) {
  if (!Number.isFinite(now.getTime()) || !Number.isInteger(userCount) || userCount < 12 || userCount > 100 ||
      !Number.isInteger(flagCount) || flagCount < 27 || flagCount > 500 ||
      !Number.isInteger(postCount) || postCount < 12 || postCount > 500) {
    throw new RangeError("Seed expects 12–100 users, 27–500 flags, 12–500 posts, and a valid date.");
  }
  const users = [
    ["mina", "Mina Kim", "mina.kim.demo@cosnap.staging"], ["joon", "Joon Park", "joon.park.demo@cosnap.staging"],
    ["yuna", "Yuna Lee", "yuna.lee.demo@cosnap.staging"], ["alex", "Alex Chen", "alex.chen.demo@cosnap.staging"],
    ["maya", "Maya Santos", "maya.santos.demo@cosnap.staging"], ["lucas", "Lucas Martin", "lucas.martin.demo@cosnap.staging"],
    ["sora", "Sora Tanaka", "sora.tanaka.demo@cosnap.staging"], ["theo", "Theo Bernard", "theo.bernard.demo@cosnap.staging"],
    ["hana", "Hana Choi", "hana.choi.demo@cosnap.staging"], ["olivia", "Olivia Reed", "olivia.reed.demo@cosnap.staging"],
    ["daniel", "Daniel Wong", "daniel.wong.demo@cosnap.staging"], ["clara", "Clara Silva", "clara.silva.demo@cosnap.staging"],
  ].map(([key, username, email]) => ({ id: ids[key], username, email }));

  const profiles = [
    ["mina", "Mina Kim", "Fujifilm X-T5", ["street", "portrait"], ["Korean", "English"], "Seoul local. Happy to trade portraits and hidden cafe tips.", "photo-1494790108377-be9c29b29330", 92, "Crystal", true],
    ["joon", "Joon Park", "Sony A7 IV", ["film", "night"], ["Korean", "Japanese", "English"], "Night photography and quiet city walks.", "photo-1500648767791-00dcc994a43e", 84, "Clear", true],
    ["yuna", "Yuna Lee", "Ricoh GR III", ["food", "street"], ["Korean", "English"], "Solo traveler collecting food stories one market at a time.", "photo-1534528741775-53994a69daeb", 76, "Clear", false],
    ["alex", "Alex Chen", "Canon R6 Mark II", ["landscape", "portrait"], ["English", "Mandarin", "Japanese"], "Tokyo-based photographer. Sunrise shoots welcome.", "photo-1506794778202-cad84cf45f1d", 88, "Crystal", true],
    ["maya", "Maya Santos", "Sony ZV-E10", ["travel", "video"], ["English", "Tagalog", "Thai"], "Remote worker exploring Southeast Asia with camera in hand.", "photo-1544005313-94ddf0286df2", 68, "Focusing", false],
    ["lucas", "Lucas Martin", "Leica Q3", ["architecture", "street"], ["English", "French", "Portuguese"], "Lisbon local sharing photo walks and pastel de nata.", "photo-1519085360753-af0119f7cbe7", 81, "Clear", true],
    ["sora", "Sora Tanaka", "Nikon Zf", ["film", "food"], ["Japanese", "English"], "Kyoto resident documenting small shops and seasonal light.", "photo-1517841905240-472988babdf9", 79, "Clear", true],
    ["theo", "Theo Bernard", "Canon AE-1", ["film", "architecture"], ["French", "English"], "Paris film photographer. Always looking for a good walk and better light.", "photo-1507003211169-0a1dd7228f2d", 73, "Clear", false],
    ["hana", "Hana Choi", "Sony A6700", ["portrait", "travel"], ["Korean", "English", "Thai"], "Busan-born traveler. I like portraits with sea wind and real smiles.", "photo-1531123897727-8f129e1688ce", 86, "Crystal", true],
    ["olivia", "Olivia Reed", "Fujifilm X100VI", ["street", "food"], ["English", "Spanish"], "New York creative sharing neighborhood food and photo routes.", "photo-1524504388940-b1c1722653e1", 70, "Focusing", false],
    ["daniel", "Daniel Wong", "DJI Osmo Pocket 3", ["video", "travel"], ["English", "Cantonese", "Thai"], "Travel video maker based between Bangkok and Hong Kong.", "photo-1504593811423-6dd665756598", 74, "Clear", true],
    ["clara", "Clara Silva", "Olympus OM-5", ["nature", "street"], ["Portuguese", "English", "French"], "Lisbon weekend hiker and relaxed photo walk host.", "photo-1488426862026-3ee34a7d66df", 65, "Focusing", false],
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
    ["b9999999-9999-4999-8999-999999999999", "hana", "Busan", "KR", 35.1796, 129.0756, "photo", "Haeundae sunrise portraits", "photo", "Early beach portraits and coffee after the shoot.", 4, 2],
    ["b1010101-1010-4010-8010-101010101010", "hana", "Busan", "KR", 35.1587, 129.1604, "meet", "Gamcheon color walk", "sightseeing", "Slow walk through Gamcheon with cameras and snack stops.", 8, 2],
    ["b1212121-1212-4212-8212-121212121212", "sora", "Kyoto", "JP", 35.0116, 135.7681, "photo", "Gion blue-hour street session", "photo", "Small group shoot when lanterns start to glow.", 5, 2],
    ["b1313131-1313-4313-8313-131313131313", "sora", "Kyoto", "JP", 35.0394, 135.7292, "free", "Kyoto rain-day photo spots", "other", "Sharing covered alleys and cafes with window light.", 10, 3],
    ["b1414141-1414-4414-8414-141414141414", "theo", "Paris", "FR", 48.8566, 2.3522, "meet", "Canal Saint-Martin film walk", "sightseeing", "Bring any camera. We will trade film and coffee tips.", 6, 2],
    ["b1515151-1515-4515-8515-151515151515", "theo", "Paris", "FR", 48.8606, 2.3376, "offer", "Louvre exterior portrait help", "other", "I can take a few edited portraits around golden hour.", 12, 2],
    ["b1616161-1616-4616-8616-161616161616", "daniel", "Bangkok", "TH", 13.7308, 100.5418, "help", "Need Thai menu translation", "other", "Could use help ordering at a local lunch spot.", 3, 1],
    ["b1717171-1717-4717-8717-171717171717", "daniel", "Bangkok", "TH", 13.7466, 100.5347, "emergency", "Lost wallet near Siam", "other", "Need help finding tourist police desk and translation support.", 2, 1],
    ["b1818181-1818-4818-8818-181818181818", "olivia", "New York", "US", 40.758, -73.9855, "photo", "Times Square motion portraits", "photo", "Testing slow shutter portraits after sunset.", 5, 2],
    ["b1919191-1919-4919-8919-191919191919", "olivia", "New York", "US", 40.7295, -73.9965, "free", "Free West Village coffee list", "other", "Sharing saved independent cafes with good table light.", 9, 3],
    ["b2020202-2020-4020-8020-202020202020", "clara", "Lisbon", "PT", 38.7139, -9.1394, "meet", "Miradouro picnic and photos", "food_tour", "Sunset snacks, city views, and candid travel photos.", 7, 2],
    ["b2121212-2121-4121-8121-212121212121", "clara", "Lisbon", "PT", 38.7078, -9.1366, "offer", "Easy Sintra day-trip planning", "other", "Happy to help plan trains, timing, and photo stops.", 13, 2],
    ["b2222222-3333-4333-8333-333333333333", "joon", "Seoul", "KR", 37.5796, 126.977, "help", "Film camera battery question", "other", "Need a nearby store for an old film camera battery.", 4, 1],
    ["b2323232-2323-4323-8323-232323232323", "mina", "Seoul", "KR", 37.5446, 127.0557, "meet", "Seongsu cafe portrait swap", "photo", "Bring one outfit and we will trade ten edited portraits.", 10, 2],
    ["b2424242-2424-4424-8424-242424242424", "alex", "Tokyo", "JP", 35.6586, 139.7454, "offer", "Tokyo Tower night composition tips", "other", "I can share my favorite framing points and settings.", 14, 2],
    ["b2525252-2525-4525-8525-252525252525", "yuna", "Bangkok", "TH", 13.7367, 100.5231, "free", "Spare SD card reader", "other", "Giving away a USB-C reader before my flight.", 6, 2],
    ["b2626262-2626-4626-8626-262626262626", "theo", "London", "GB", 51.5074, -0.1278, "photo", "South Bank evening portraits", "photo", "Looking for a portrait partner along the Thames at blue hour.", 7, 2],
    ["b2727272-2727-4727-8727-272727272727", "daniel", "Singapore", "SG", 1.3521, 103.8198, "meet", "Marina Bay street photo walk", "sightseeing", "Casual evening walk for skyline and street photography.", 9, 2],
    ["b2828282-2828-4828-8828-282828282828", "clara", "Sydney", "AU", -33.8688, 151.2093, "offer", "Harbour sunrise photo route", "other", "Happy to share a relaxed sunrise route around Circular Quay.", 11, 2],
  ].map(([id, userKey, city, country, latitude, longitude, type, title, meetupCategory, note, startDays, duration]) => ({
    id, userId: ids[userKey], city, country, latitude, longitude, type, title, meetupCategory, note,
    styles: ["street", "travel"], languages: ["English", "Korean"], startDate: dateAfter(now, startDays), endDate: dateAfter(now, startDays + duration),
  }));

  const posts = [
    ["c1111111-1111-4111-8111-111111111111", "yuna", "help", "Where to print film in Bangkok?", "Looking for a same-day film lab near Chinatown. Happy to share a coffee for help.", null, null, 13.738, 100.511, 2],
    ["c2222222-2222-4222-8222-222222222222", "lucas", "offer", "Alfama sunset photo guide", "Two-hour route through viewpoints and tiled streets. Bring comfortable shoes.", 20, "EUR", 38.711, -9.13, 6],
    ["c3333333-3333-4333-8333-333333333333", "mina", "free", "Spare phone tripod", "Giving away a compact phone tripod near Myeongdong before I leave Seoul.", null, null, 37.5636, 126.9869, 4],
    ["c4444444-4444-4444-8444-444444444444", "maya", "meet", "Coffee and edit session", "Bring laptop or phone. Let's edit travel photos together in Central Park.", null, null, 40.7812, -73.9665, 8],
    ["c5555555-5555-4555-8555-555555555555", "hana", "photo", "Busan beach portrait exchange", "Looking for one person to swap ten quick edited portraits at Haeundae.", null, null, 35.1587, 129.1604, 5],
    ["c6666666-6666-4666-8666-666666666666", "sora", "offer", "Kyoto film camera walk", "Two-hour walk through Gion with tips for manual exposure.", 1500, "JPY", 35.0037, 135.7788, 7],
    ["c7777777-7777-4777-8777-777777777777", "theo", "help", "Where can I buy 35mm film in Paris?", "Seeking a shop with color negative film near Le Marais.", null, null, 48.8575, 2.3622, 3],
    ["c8888888-8888-4888-8888-888888888888", "olivia", "meet", "Brooklyn bridge sunrise walk", "Early walk for skyline photos and calm conversation.", null, null, 40.7061, -73.9969, 6],
    ["c9999999-9999-4999-8999-999999999999", "daniel", "offer", "Bangkok street video tips", "I can help with gimbal movement and mobile color grading.", 300, "THB", 13.744, 100.534, 8],
    ["c1010101-1010-4010-8010-101010101010", "clara", "free", "Lisbon tram photo route PDF", "Sharing a printable route for early tram photography.", null, null, 38.717, -9.139, 10],
    ["c1212121-1212-4212-8212-121212121212", "alex", "photo", "Shibuya rain portrait test", "Need a partner for umbrella portraits after rain.", null, null, 35.6595, 139.7005, 4],
    ["c1313131-1313-4313-8313-131313131313", "joon", "emergency", "Need first-aid kit near Itaewon", "Looking for a pharmacy or someone with basic supplies.", null, null, 37.5345, 126.9946, 1],
  ].map(([id, userKey, type, title, description, price, currency, latitude, longitude, expiresDays]) => ({
    id, userId: ids[userKey], type, title, description, price, currency, latitude, longitude, expiresAt: dateAfter(now, expiresDays),
  }));

  const offers = [
    ["d1111111-1111-4111-8111-111111111111", "joon", "mina", flags[0].id, "I know Bukchon well. Want to swap portraits around 5pm?", "accepted"],
    ["d2222222-2222-4222-8222-222222222222", "maya", "lucas", flags[4].id, "Your Alfama route sounds perfect. Can I join with a small camera?", "pending"],
    ["d3333333-3333-4333-8333-333333333333", "yuna", "alex", flags[2].id, "I will be in Tokyo too. Interested in an early Asakusa walk?", "accepted"],
    ["d4444444-4444-4444-8444-444444444444", "olivia", "hana", flags[8].id, "I will be in Busan for sunrise too. Can we trade portraits?", "pending"],
    ["d5555555-5555-4555-8555-555555555555", "clara", "sora", flags[10].id, "Gion blue hour sounds lovely. I can bring a spare battery.", "accepted"],
    ["d6666666-6666-4666-8666-666666666666", "theo", "daniel", flags[15].id, "I am sorry about your wallet. I can help translate by phone.", "declined"],
    ["d7777777-7777-4777-8777-777777777777", "mina", "olivia", flags[16].id, "Slow shutter portraits are my favorite. Count me in.", "accepted"],
    ["d8888888-8888-4888-8888-888888888888", "alex", "clara", flags[19].id, "Could you share your Sintra timing tips with me?", "pending"],
    ["d9999999-9999-4999-8999-999999999999", "hana", "joon", flags[20].id, "I have a compatible spare battery if you still need one.", "declined"],
  ].map(([id, senderKey, receiverKey, flagId, message, status]) => ({ id, senderId: ids[senderKey], receiverId: ids[receiverKey], flagId, message, status, sentAt: dateAfter(now, -1) }));

  const conversations = [
    ["e1111111-1111-4111-8111-111111111111", "joon", "mina", offers[0].id], ["e2222222-2222-4222-8222-222222222222", "yuna", "alex", offers[2].id],
    ["e3333333-3333-4333-8333-333333333333", "clara", "sora", offers[4].id], ["e4444444-4444-4444-8444-444444444444", "mina", "olivia", offers[6].id],
    ["e5555555-5555-4555-8555-555555555555", "theo", "daniel", offers[5].id],
  ].map(([id, userAKey, userBKey, offerId]) => ({ id, userAId: ids[userAKey], userBId: ids[userBKey], offerId }));

  const messages = [
    ["f1111111-1111-4111-8111-111111111111", 0, "joon", "5pm works. I will bring a small reflector.", true, -1], ["f2222222-2222-4222-8222-222222222222", 0, "mina", "Great, meet at Anguk Station exit 2?", true, -1], ["f3333333-3333-4333-8333-333333333333", 0, "joon", "Perfect. See you there!", false, 0],
    ["f4444444-4444-4444-8444-444444444444", 1, "yuna", "I can meet near the Kaminarimon gate at 7am.", true, -1], ["f5555555-5555-4555-8555-555555555555", 1, "alex", "Sounds good. Morning light should be beautiful.", true, -1], ["f6666666-6666-4666-8666-666666666666", 1, "yuna", "See you then!", false, 0],
    ["f7777777-7777-4777-8777-777777777777", 2, "clara", "I will be at the Yasaka Shrine gate before sunset.", true, -1], ["f8888888-8888-4888-8888-888888888888", 2, "sora", "Perfect. I will bring an extra battery too.", false, 0],
    ["f9999999-9999-4999-8999-999999999999", 3, "mina", "I can bring a neutral umbrella for the portraits.", true, -1], ["f1010101-1010-4010-8010-101010101010", 3, "olivia", "Amazing. Meet by the TKTS stairs at 7:30?", false, 0],
    ["f1212121-1212-4212-8212-121212121212", 4, "theo", "I found the tourist police desk on the map.", true, -1], ["f1313131-1313-4313-8313-131313131313", 4, "daniel", "Thank you, I have local help now. Really appreciate it.", true, 0],
    ["f1414141-1414-4414-8414-141414141414", 2, "clara", "Do you prefer digital or film?", true, -1], ["f1515151-1515-4515-8515-151515151515", 2, "sora", "Film, but I will bring a digital backup too.", false, 0],
    ["f1616161-1616-4616-8616-161616161616", 3, "mina", "Yes, I will be there five minutes early.", true, 0], ["f1717171-1717-4717-8717-171717171717", 4, "theo", "Glad you are safe. Enjoy Bangkok.", true, 0],
    ["f1818181-1818-4818-8818-181818181818", 0, "mina", "I will send you the exact pin shortly.", true, 0], ["f1919191-1919-4919-8919-191919191919", 1, "alex", "I will bring warm coffee for us both.", true, 0],
  ].map(([id, conversationIndex, senderKey, content, isRead, days]) => ({ id, conversationId: conversations[conversationIndex].id, senderId: ids[senderKey], content, isRead, createdAt: dateAfter(now, days, 0) }));

  const matches = [
    ["11111111-1111-4111-8111-111111111111", offers[0], flags[0], "joon", "mina", "Anguk Station exit 2", "scheduled"],
    ["22222222-2222-4222-8222-222222222222", offers[2], flags[2], "yuna", "alex", "Kaminarimon gate", "completed"],
    ["33333333-3333-4333-8333-333333333333", offers[4], flags[10], "clara", "sora", "Yasaka Shrine gate", "completed"],
  ].map(([id, offer, flag, userAKey, userBKey, locationHint, status]) => ({ id, offerId: offer.id, userAId: ids[userAKey], userBId: ids[userBKey], flagId: flag.id, scheduledAt: flag.startDate, locationHint, status }));

  const reviews = [
    ["22222222-2222-4222-8222-222222222222", matches[2].id, "sora", "clara", 5, "Friendly, punctual, and knew every great photo spot."],
    ["55555555-5555-4555-8555-555555555555", matches[1].id, "yuna", "alex", 5, "Alex made the early start easy and shared thoughtful composition tips."],
    ["66666666-6666-4666-8666-666666666666", matches[1].id, "alex", "yuna", 5, "Warm, reliable, and great at finding candid moments."],
    ["77777777-7777-4777-8777-777777777777", matches[2].id, "clara", "sora", 4, "Lovely Kyoto route and patient advice for film exposure."],
  ].map(([id, matchId, authorKey, targetKey, rating, comment]) => ({ id, matchId, authorId: ids[authorKey], targetId: ids[targetKey], rating, comment, photoSampleUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=640&q=80" }));

  // Completed sessions and their reviews belong in the past. Keep one upcoming
  // scheduled session, and ensure offers predate the completed sessions.
  for (const match of matches.filter(item => item.status === "completed")) {
    const flag = flags.find(item => item.id === match.flagId);
    flag.startDate = dateAfter(now, -8, 0);
    flag.endDate = dateAfter(now, -7, 0);
    flag.visibilityStatus = "expired";
    match.scheduledAt = flag.startDate;
    offers.find(item => item.id === match.offerId).sentAt = dateAfter(now, -10, 0);
  }

  const demoId = (prefix, index) => `${prefix}000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
  for (let index = users.length; index < userCount; index++) {
    const id = demoId("ac", index);
    const username = `Demo Traveler ${String(index + 1).padStart(3, "0")}`;
    users.push({ id, username, email: `traveler.${index + 1}.demo@cosnap.staging` });
    profiles.push({ ...profiles[index % 12], id, username, bio: "Synthetic traveler for CoSnap demonstrations. Not a real person." });
  }
  const baseFlags = [...flags];
  for (let index = flags.length; index < flagCount; index++) {
    const template = baseFlags[index % baseFlags.length];
    const profile = profiles[index % profiles.length];
    const expired = index % 9 === 0;
    const startDays = expired ? -10 : 1 + index % 45;
    flags.push({ ...template, id: demoId("bc", index), userId: profile.id,
      title: `${template.title} #${index + 1}`,
      latitude: template.latitude + ((index % 7) - 3) * 0.008,
      longitude: template.longitude + ((index % 11) - 5) * 0.008,
      styles: [...profile.styles], languages: [...profile.languages],
      startDate: dateAfter(now, startDays, 0), endDate: dateAfter(now, startDays + 2, 0),
      visibilityStatus: expired ? "expired" : index % 13 === 0 ? "hidden" : "active",
    });
  }
  const basePosts = [...posts];
  for (let index = posts.length; index < postCount; index++) {
    posts.push({ ...basePosts[index % basePosts.length], id: demoId("cc", index),
      userId: profiles[index % profiles.length].id,
      title: `${basePosts[index % basePosts.length].title} #${index + 1}`,
      expiresAt: dateAfter(now, index % 10 === 0 ? -1 : 1 + index % 21, 0),
    });
  }
  for (const user of users) user.username = `[Demo] ${user.username}`;
  profiles.forEach((profile, index) => {
    profile.username = users[index].username;
    profile.role = index % 4 === 0 ? "premium" : "free";
    profile.isVerified = false;
    profile.bio = `[Synthetic demo profile] ${profile.bio}`;
  });
  for (const flag of flags) {
    flag.title = `[Demo] ${flag.title}`;
    flag.note = `[Synthetic demo; not a live request] ${flag.note}`;
    flag.visibilityStatus ??= "active";
    flag.sourcePolicyType = profiles.find(profile => profile.id === flag.userId).role;
    flag.exposurePolicy = flag.sourcePolicyType === "premium" ? "premium_pinned" : "default";
  }
  for (const post of posts) {
    post.title = `[Demo] ${post.title}`;
    post.description = `[Synthetic demo; not a live request] ${post.description}`;
  }

  return { users, profiles, flags, posts, offers, conversations, messages, matches, reviews };
}
