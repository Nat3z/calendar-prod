export const BASE_URL = "https://flex.nat3z.com/api/v1";

export async function intoFlexAccessToken() {
  const flexAccessToken = localStorage.getItem("flex_access_token");
  if (flexAccessToken) {
    const { token, expires_at } = JSON.parse(flexAccessToken);
    if (Date.now() < expires_at) {
      return token;
    }
  }
  const refreshToken = localStorage.getItem("flex_refresh_token");
  if (!refreshToken) {
    console.error("Flex: No refresh token found");
    return undefined;
  }

  const response = await fetch("/api/flex/token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    console.error("Flex: Failed to refresh token");
    return undefined;
  }
  const data = await response.json();
  // store the access token and the expiration date
  localStorage.setItem("flex_access_token", JSON.stringify({
    token: data.access_token,
    expires_at: Date.now() + 1000 * 60 * 14,
  }));
  return data.access_token;
};

export async function getFlexTimes() {
  const response = await fetch("/api/flex/flextimes", {
    method: "GET",
  });
  if (!response.ok) {
    console.error("Flex: Failed to get flex times");
    return [];
  }
  const data = await response.json();
  return data.flextimes as {
    id: number;
    date: number;
    shutoff: number;
  }[] | undefined;
}

let processingQuery = false;
export async function getMyFlexes(targetedTime?: number) {
  if (processingQuery) {
    console.log("Processing query");
    return undefined;
  }
  processingQuery = true;
  const accessToken = await intoFlexAccessToken();
  if (!accessToken) {
    return [];
  }

  // Check sessionStorage first and check if it's expired
  const storageKey = `flex_assignments_${targetedTime || 'default'}`;
  const cached = sessionStorage.getItem(storageKey);
  if (cached) {
    const { data, expires_at } = JSON.parse(cached);
    if (Date.now() < expires_at) {
      processingQuery = false;
      return data as {
        activityId: number;
        activityName: string;
        flexId: number;
        flexTimeId: number;
        roomName: string;
      }[] | undefined;
    }
  }

  let url = new URL(`${BASE_URL}/user/flex`);
  if (targetedTime) {
    url.searchParams.set("flexTimeId", targetedTime.toString());
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    console.error(await response.text());
    processingQuery = false;
    return [];
  }
  const data = await response.json();
  if (!response.ok) {
    console.error("Flex: Failed to get my flexes");
    processingQuery = false;
    return [];
  }

  // Store in sessionStorage
  sessionStorage.setItem(storageKey, JSON.stringify({
    data: data.assignments,
    expires_at: Date.now() + 1000 * 60 * 10,
  }));

  processingQuery = false;

  console.log("data", data);
  return data.assignments as {
    activityId: number;
    activityName: string;
    flexId: number;
    flexTimeId: number;
    roomName: string;
    userId: number;
  }[] | undefined;
}

export async function getFlexUser() {
  const accessToken = await intoFlexAccessToken();
  if (!accessToken) {
    return undefined;
  }

  const storageKey = `flex_user`;
  const cached = sessionStorage.getItem(storageKey);
  if (cached) {
    const { data, expires_at } = JSON.parse(cached);
    if (Date.now() < expires_at) {
      return data as {
        id: number;
        email: string;
        name: string;
        role: string;
      } | undefined;
    }
  }

  const response = await fetch(BASE_URL + "/user/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Flex: Failed to get user");
    return undefined;
  }

  sessionStorage.setItem(storageKey, JSON.stringify({
    data: data.user,
    expires_at: Date.now() + 1000 * 60 * 60,
  }));
  return data.user as {
    id: number;
    email: string;
    name: string;
    role: string;
  } | undefined;
}
