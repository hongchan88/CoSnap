import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Tailwind,
  Text,
  Section,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeProps {
  username: string;
}

export default function WelcomeEmail({ username }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Body className="bg-[#0b1224] text-gray-100 my-8 w-full">
        <Tailwind>
          <Container className="mx-auto max-w-2xl px-4">
            <Section className="bg-gradient-to-br from-[#1b3cf3] via-[#6739ff] to-[#0acffe] text-white rounded-3xl px-10 py-12 shadow-2xl overflow-hidden">
              <Text className="text-[11px] uppercase tracking-[0.35em] text-blue-100 mb-3">
                CoSnap Boarding Pass
              </Text>
              <Text className="text-4xl font-extrabold leading-tight mb-3">
                Welcome aboard, {username}
              </Text>
              <Text className="text-lg opacity-90 leading-relaxed">
                You just unlocked a map of makers. Tune your profile and drop
                your first flag so collaborators know where to find you.
              </Text>
              <Section className="mt-8">
                <Button
                  className="bg-white text-[#0b1224] text-lg font-semibold px-8 py-4 rounded-2xl shadow-lg w-full inline-block"
                  href="http://localhost:3000/profile"
                >
                  Finish my profile
                </Button>
                <Text className="text-sm text-blue-100 mt-4">
                  Most people complete setup in under 2 minutes.
                </Text>
              </Section>
            </Section>

            <Section className="bg-white text-gray-900 rounded-3xl px-10 py-10 shadow-xl -mt-6 relative z-10">
              <Text className="text-sm font-semibold uppercase tracking-wide text-indigo-600 mb-6">
                Your first three moves
              </Text>

              <div className="flex items-start gap-4 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-lg font-bold">
                  1
                </span>
                <div>
                  <Text className="text-lg font-semibold mb-1">
                    Shape your profile
                  </Text>
                  <Text className="text-gray-600 leading-relaxed">
                    Pick your vibe, skills, and time zone so the right people
                    spot you fast.
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-lg font-bold">
                  2
                </span>
                <div>
                  <Text className="text-lg font-semibold mb-1">
                    Drop your first flag
                  </Text>
                  <Text className="text-gray-600 leading-relaxed">
                    Tell the community what you are building and the help you
                    are open to. The clearer the flag, the faster the replies.
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-lg font-bold">
                  3
                </span>
                <div>
                  <Text className="text-lg font-semibold mb-1">
                    Explore live signals
                  </Text>
                  <Text className="text-gray-600 leading-relaxed">
                    Follow fellow builders in your time zone and check out
                    trending flags to jump into a conversation.
                  </Text>
                </div>
              </div>

              <Section className="mt-10">
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-2xl w-full block px-8 py-4 mb-3"
                  href="http://localhost:3000/profile"
                >
                  Complete profile
                </Button>
                <Button
                  className="bg-indigo-50 text-indigo-700 text-lg font-semibold rounded-2xl w-full block px-8 py-4 border border-indigo-100"
                  href="http://localhost:3000/flags"
                >
                  Drop your first flag
                </Button>
              </Section>
            </Section>

            <Section className="mt-8 bg-[#0e1530] border border-[#1f2b50] rounded-2xl px-8 py-7 text-gray-50">
              <Text className="text-base font-semibold mb-2">Signal boost</Text>
              <Text className="text-gray-200 leading-relaxed">
                Share a clear goal on your first flag: what you want to build,
                the help you need, and when you are online. It helps collaborators
                arrive faster.
              </Text>
              <Hr className="my-6 border-[#1f2b50]" />
              <Text className="text-sm text-gray-400">
                Need anything? Reply to this email and a person from the team
                will help you out.
              </Text>
              <Text className="text-xs text-gray-500 mt-4">
                © 2025 CoSnap Inc. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Tailwind>
      </Body>
    </Html>
  );
}
