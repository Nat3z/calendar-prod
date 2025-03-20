import type { APIRoute } from "astro";
import { BASE_URL } from "../../../lib/flex";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const accessToken = body.access_token;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No access token found" }), { status: 401 });
  }
  let url = new URL(`${BASE_URL}/user/flex`);
    url.searchParams.set("flexTimeId", body.flexTimeId);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    console.error(await response.text())
    return new Response(JSON.stringify({ error: "Failed to find flex" }), { status: 500 });
  }
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
