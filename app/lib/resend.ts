import { Resend } from "resend";
import WelcomeEmail from "../emails/Welcome";

export async function sendWelcomeEmail(
  to: string,
  username: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set. Skipping welcome email send.");
    return;
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "CoSnap <hello@cosnap.com>",
      to: [to],
      subject: `Welcome to CoSnap, ${username}! 🎉`,
      react: WelcomeEmail({ username }),
    });

    console.log(`✅ Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${to}:`, error);
  }
}
