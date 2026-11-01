// Mock payment callbacks must never grant paid access. A real payment provider
// must verify a signed webhook before subscriptions or roles can be changed.
export async function loader() {
  return new Response("Mock payments are disabled.", { status: 410 });
}
