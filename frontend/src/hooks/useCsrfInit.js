// src/hooks/useCsrfInit.js
import { useEffect } from "react";

export const useCsrfInit = () => {
    useEffect(() => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
        const fetchCsrfToken = async () => {
            try {
                await fetch(`${API_BASE_URL}/api/main/init`, {
                    credentials: "include",
                });
            } catch (err) {
                console.error("Failed to fetch CSRF token:", err);
            }
        };

        fetchCsrfToken();
    }, []);
};
