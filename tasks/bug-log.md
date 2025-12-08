# Bug Log

## Active Bugs

- [ ] **Notification Redirection to Invalid Link**
  - **Issue:** Clicking a notification redirects to `/inbox`, which no longer exists.
  - **Expected Behavior:** It should redirect to the "Message" tab on the user's profile page (e.g., `/profile?tab=messages`).
  - **Status:** Fixed
  - **Priority:** High

- [x] **Active Flags Visualization**
  - **Issue:** Active flags are not clearly distinct or the section might be missing/labeled incorrectly in `app/routes/flags.tsx`.
  - **Expected Behavior:** Explicitly "Create Active Flags" section or logic to ensure current/ongoing flags are displayed as "Active".
  - **Status:** Verified (Logic exists and correct)
  - **Priority:** Medium

- [x] **Chat Navigation Button**
  - **Issue:** No direct way to navigate to the chat/messages tab from the main profile view.
  - **Status:** Fixed
  - **Priority:** Medium

- [ ] **Smart Message Notifications (Spam Prevention)**
  - **Issue:** Sending a notification for *every* single chat message can be spammy (e.g., rapid-fire texts).
  - **Recommendation:**
    1.  **Debouncing:** Only create a new `notification` entry if the last notification for this conversation was > 5 minutes ago OR if the user has `read` the previous messages.
    2.  **Presence Check:** If possible, don't notify if the user is currently viewing the chat (client-side check or presence state).
    3.  **Grouping:** Group multiple messages from the same user into one summary notification (e.g., "5 new messages from User A").
  - **Status:** Open
  - **Priority:** Medium
