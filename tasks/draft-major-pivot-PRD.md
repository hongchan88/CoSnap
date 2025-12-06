# 📘 CoSnap Connect – Product Requirement Document (PRD)
### *Travel SOS & Micro-Help Network with Free/Premium Model*
**Version: 2.0 — AI IDE Friendly Version**

---

# 1. Product Overview
CoSnap Connect is a map-based real-time traveler network that helps people get quick assistance, share resources, seek companionship, or exchange information during travel.

Originally a photo-swap app, the platform evolved to support a broader range of travel needs:
- Help
- Emergency
- Free giveaways
- Meetups
- Paid assistance (Offer)
- Photo exchange

CoSnap Connect connects travelers **when they actually need help**, not just socially.

---

# 2. Core Principles
1. **Location-first** — all content is tied to real positions on a map.
2. **Small but real needs** — language help, minor emergencies, item sharing, meetups.
3. **Trust-driven** — reviews and simple reputation.
4. **Fair monetization** — clear value difference between Free & Premium.
5. **Simple & fast** — quick help → quick connection → quick resolution.

---

# 3. Feature Overview
- Post creation (Help, Emergency, Free, Meet, Photo, Offer)
- Map-based discovery
- Flags (1 Free / 5 Premium)
- Direct messaging (DM)
- Credit system for Free users
- Free vs Premium access levels
- Review system
- User profile
- Reporting system

---

# 4. Posts (Content System)
Users can create different categories of posts.

## 4.1 Post Types
| Type | Purpose | Example |
|------|---------|---------|
| help | General assistance | “Need Thai translation for 2 hours, 100 THB” |
| emergency | Urgent help | “Hurt ankle — which hospital is good?” |
| free | Free giveaways | “Free slippers & bug spray before flight” |
| meet | Meetups | “Anyone going to Doi Suthep sunrise?” |
| photo | Photo exchange | “Let’s take portraits for each other” |
| offer | Paid help | “Can drive scooter for you today, 200 THB” |

## 4.2 Required Behaviors
- Posts appear on the map at a specific location.
- Posts auto-hide after their expiration time.
- Emergency posts get **priority visibility**.
- DM can be initiated from any post.

---

# 5. Map-Based Discovery
- Only posts inside the current viewport appear.
- Posts update dynamically as the map moves.
- Category filters refine the results.
- Flags appear on the map to show user presence.
- Premium flags & posts may receive **priority placement**.

---

# 6. Flags System

## 6.1 Free User Rules
- Only **1 flag** allowed.
- Flag must be at **current GPS location**.
- Cannot choose arbitrary locations.
- Must delete existing flag to add a new one.

## 6.2 Premium User Rules
- Up to **5 flags** allowed.
- Flags can be placed **anywhere** on the map.
- Great for planning ahead (future destinations).
- Premium flags can have priority visibility.

## 6.3 Flag Use Cases
- Marking current accommodation
- Marking tomorrow’s travel location (Premium)
- Identifying where help is needed

---

# 7. Direct Messaging (DM)
DM enables direct 1:1 conversation.

## 7.1 DM Flow
- Tap “DM” on a post → open or create a conversation thread.
- Free users must use Credits.
- Premium users send unlimited messages for free.

## 7.2 Free User Rules
- Starting a DM costs **1 credit**.
- If insufficient credits → show:
  - “Buy Credits”
  - “Upgrade to Premium”

## 7.3 Premium User Rules
- Unlimited free DMs.

## 7.4 Thread Behavior
- First message creates a new thread.
- Thread ties back to the post.
- Review prompt appears after the interaction qualifies.

---

# 8. Credit System

## 8.1 Usage
- 1 DM start = **1 credit**

## 8.2 Purchase Packages
(Pricing TBD)
- Small (10 credits)
- Medium (30 credits)
- Large (100 credits)

## 8.3 Rules
- Credits do not expire (MVP)
- Non-refundable
- Premium users do not use credits

---

# 9. Premium Subscription
Premium users get:
- **5 flags**
- **Flags anywhere** on the map
- **Unlimited DMs**
- **No ads**
- **Priority visibility**
- Premium badge on profile

### Free → Premium Upgrade Moments
- Attempting to create 2nd flag
- Attempting to drop flag outside current GPS
- Attempting to DM without credits

---

# 10. Review System

## 10.1 Review Eligibility
A user can leave a review only if:
1. A DM thread exists between the two users  
2. At least **3 messages each** were exchanged (to ensure meaningful interaction)

## 10.2 Review Fields
- Rating (1–5)
- Comment
- Reviewer
- Reviewee

## 10.3 Review Impact
- Profile displays:
  - Average rating
  - Total review count
  - Recent comments
- Helps build user trust

---

# 11. User Profiles
Profile includes:
- Username / nickname
- Languages
- Bio / about me
- Flags (active)
- Reviews
- User type (Free / Premium)

Trust signals (rating, reviews, premium badge) appear prominently.

---

# 12. Safety & Moderation
- “Report” button on every post and profile.
- Emergency posts show:
  > “This is community advice, not professional medical advice.”
- Spam prevention:
  - Emergency posts limited to 2/day
  - Duplicate text detection recommended

---

# 13. UX Flow Summary

## 13.1 Free User
1. Browse posts on map  
2. Create 1 flag at GPS location  
3. Try to create 2nd flag → upgrade prompt  
4. DM requires credits  
5. Reviews available after interaction  

## 13.2 Premium User
1. Create up to 5 flags anywhere  
2. Unlimited free DMs  
3. Priority visibility  
4. No ads  

---

# 14. Screens / UI Structure

## 14.1 Main Screen
- Full map view
- Filters
- Post list (side or bottom)
- Create Post button

## 14.2 Create Post
- Category selector
- Title
- Description
- Price (optional)
- Location picker (Premium only)
- GPS auto-location for Free users

## 14.3 Post Detail
- Map snippet
- Post info
- DM button
- Profile preview
- Report button

## 14.4 DM Screen
- Chat thread
- Message composer
- “Leave a review” CTA after interaction

## 14.5 Profile Screen
- Ratings
- Review comments
- Flags
- Posts
- User type badge

---

# 15. MVP Scope

## Included
- All post types
- Map discovery
- Flags (1 Free / 5 Premium)
- Credits & purchases
- DM system
- Reviews
- Basic profile
- Reporting
- Emergency priority

## Excluded (Future Phases)
- Payments integration
- Push notifications
- Multiple photo uploads
- Group chat
- Automated itinerary detection

---

# 16. Roadmap

## Week 1
- Post system  
- Flags system  
- Map filtering  

## Week 2
- DM & Credits  
- Reviews  
- Premium upsells  

## Week 3
- QA  
- Beta release  
- UI polish  

---

# ✔ PRD COMPLETE (AI IDE READY)
This PRD is written specifically to help AI coding assistants:
- Understand all business logic
- Generate data models automatically
- Propose UI structure
- Infer component boundaries
- Build workflows without needing API/backend details

