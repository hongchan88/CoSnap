# DM & Review System Implementation Plan

## Overview
Implement the Credit-based Direct Messaging (DM) system and the interaction-based Review system.

### Core Requirements
1.  **Direct Messaging**:
    *   **Free Users**: 1 Credit per new thread.
    *   **Premium Users**: Unlimited DMs.
    *   **Backend**: Deduct credits securely.
2.  **Review System**:
    *   **Eligibility**: Users can review each other after >3 messages exchanged in a conversation.
    *   **UI**: "Leave Review" button appears when eligible.

---

## Phase 1: Database & Schema Updates

### 1.1 Update Reviews Schema
*   **File**: `app/db/schema.ts`
*   **Change**: Add `conversationId` to `reviews` table. It should be nullable (since reviews can also come from Matches).
*   **Action**:
    *   Add `conversationId: uuid("conversation_id").references(() => conversations.id)`
    *   Run `npm run db:generate`
    *   Run `npm run db:migrate`

---

## Phase 2: Backend Logic

### 2.1 Conversation Creation (Credits)
*   **File**: `app/routes/api.conversations.ts` (Already exists, but verify/enhance).
    *   **Current State**: Logic seems to be present.
    *   **Todo**: Ensure it returns a specific error code `INSUFFICIENT_CREDITS` that the frontend can catch.

### 2.2 Review Submission
*   **File**: `app/routes/api.reviews.ts` (New File).
    *   **Action**: Create an API route or Action to handle review submission.
    *   **Logic**:
        *   Check if `conversationId` is provided.
        *   Verify message count > 3 for the conversation.
        *   Verify user hasn't already reviewed this conversation/partner recently (optional but good practice).
        *   Insert review into `reviews` table.

---

## Phase 3: Frontend Implementation (DM)

### 3.1 Explore Page Integration
*   **File**: `app/components/explore/FlagListItem.tsx`
    *   **Change**: Add a distinct "Message" button alongside "Offer" (or replace it for non-offer flags).
    *   **UI**: A simple "Message" icon/button.

*   **File**: `app/routes/explore.tsx`
    *   **Change**: Implement `handleMessage(flag)`.
    *   **Logic**:
        *   Call `api.conversations` via `useFetcher`.
        *   If success: Redirect to `/inbox/$conversationId`.
        *   If error `INSUFFICIENT_CREDITS`: Open `PurchaseCreditModal`.

### 3.2 Purchase/Upgrade Modal
*   **File**: `app/components/PurchaseCreditModal.tsx` (New Component).
    *   **UI**: Explain they need credits or Premium.
    *   **Actions**: "Buy Credits" (Mock) or "Upgrade to Premium".

---

## Phase 4: Frontend Implementation (Reviews)

### 4.1 Chat Interface Updates
*   **File**: `app/routes/inbox.$conversationId.tsx`
    *   **Change**:
        *   Check `messages.length` in loader/component.
        *   If `messages.length > 3` AND active user hasn't reviewed yet (might need to fetch this status), show "Leave Review" button in the header.

### 4.2 Review Modal
*   **File**: `app/components/ReviewModal.tsx` (New Component).
    *   **UI**: Star rating (1-5), Comment text area.
    *   **Action**: Submit to `api.reviews`.

---

## Execution Steps
1.  **Schema**: Update `schema.ts` and migrate.
2.  **API**: Create `api.reviews.ts`.
3.  **UI Components**: Create `PurchaseCreditModal`, `ReviewModal`.
4.  **Integration**:
    *   Update `FlagListItem` to call `handleMessage`.
    *   Update `explore.tsx` to handle message creation and credit errors.
    *   Update `inbox.$conversationId.tsx` to show review button.
5.  **Testing**:
    *   Test Free user (0 credits) -> Blocked.
    *   Test Free user (1 credit) -> Success -> Credit deducted.
    *   Test Messaging > 3 times -> Review button appears.
    *   Test Review submission.
