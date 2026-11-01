// Payments are unavailable until a verified provider integration is configured.
export async function action() {
  return new Response("Payments are not available yet.", { status: 503 });
}
