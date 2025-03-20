import type { APIRoute } from "astro";
import { BASE_URL } from "../../../lib/flex";
export const GET: APIRoute = async ({ request }) => {
  let url = new URL(`${BASE_URL}/flextimes`);
  url.searchParams.set("application_id", import.meta.env.FLEX_CLIENT_ID);
  url.searchParams.set("secret", import.meta.env.FLEX_CLIENT_SECRET);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to get flextimes" }), { status: 500 });
  }
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}