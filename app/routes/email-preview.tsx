import { useLoaderData } from "react-router";
import WelcomeEmail from "~/emails/Welcome";
import { render } from "@react-email/render";

type LoaderData = {
  html: string;
};

export const loader = async (): Promise<LoaderData> => {
  const html = await render(<WelcomeEmail username="Test User" />);
  return { html };
};

export default function EmailPreview() {
  const data = useLoaderData() as LoaderData;
  const { html } = data;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1224] via-[#101b3a] to-[#0b1224] text-gray-100">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
              Email system
            </p>
            <h1 className="text-3xl font-bold leading-tight">
              Welcome email preview
            </h1>
            <p className="text-sm text-blue-100">
              Rendered with React Email + Tailwind. Check layout, spacing, and
              links before sending.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/10">
              HTML preview
            </span>
            <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/10">
              Desktop width
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.95fr]">
          <section className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                CoSnap • Welcome
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="h-2 w-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <iframe
              srcDoc={html}
              className="w-full h-[760px] border-0"
              sandbox="allow-same-origin"
            />
          </section>

          <aside className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-100 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Checklist
            </div>
            <div className="space-y-4 text-sm text-gray-50">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="font-semibold text-white mb-1">Content</p>
                <ul className="space-y-1 text-gray-200">
                  <li>• Subject + preheader clear</li>
                  <li>• Links point to production URLs</li>
                  <li>• Call-to-actions read well on mobile</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="font-semibold text-white mb-1">Layout</p>
                <ul className="space-y-1 text-gray-200">
                  <li>• Padding holds on small screens</li>
                  <li>• Text sizes stay legible</li>
                  <li>• Buttons stack vertically on mobile</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="font-semibold text-white mb-1">Send test</p>
                <p className="text-gray-200">
                  Forward a test to Gmail and iOS Mail to check real client
                  rendering before shipping to the list.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
