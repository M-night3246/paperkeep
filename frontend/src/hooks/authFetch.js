// src/hooks/useAuthFetch.js
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
};

export const useAuthFetch = () => {
  const { token, logout } = useContext(AuthContext);
  
  const authFetch = async (url, options = {}) => {
    const csrfToken = getCsrfTokenFromCookie();

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "X-CSRFToken": csrfToken,
    };

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout(); 
      throw new Error("Session expired. You've been logged out.");
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");

    if (response.status === 204 || !contentType) {
      return null;
    } else if (contentType.includes("application/json")) {
      return await response.json();
    } else if (contentType.includes("text/")) {
      return await response.text();
    } else {
      return null; // or throw if unsupported
    }
  };

  return authFetch;
};


