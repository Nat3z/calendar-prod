import type { APIRoute } from "astro";
import { BASE_URL } from "../../../lib/flex";
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const refreshToken = body.refresh_token;
  const response = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken, application_id: import.meta.env.FLEX_CLIENT_ID, secret: import.meta.env.FLEX_CLIENT_SECRET }),
  });
  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to refresh token" }), { status: 500 });
  }
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}