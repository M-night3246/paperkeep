import { getAuth } from "firebase/auth";

export const downloadFetch = async (url) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken(true);
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-CSRFToken": csrfToken,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  return await response.blob();
};
