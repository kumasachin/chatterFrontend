/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import axios from "axios";

import { BasePath } from "../config";
import { TokenStorage } from "../utils/tokenStorage";

const baseURL: string = `${BasePath}/api`;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token from responses
axiosInstance.interceptors.response.use(
  (response: any) => {
    // Check if response contains a token (for login/signup)
    const token = response.data?.token;
    if (token) {
      TokenStorage.setToken(token);
    }
    return response;
  },
  (error: any) => {
    // If we get 401, clear the token and redirect to login
    if (error.response?.status === 401) {
      TokenStorage.removeToken();

      // Clear any user data from stores
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const fullPath = currentPath + currentSearch;

        // Don't redirect if we're on public/auth pages that should be accessible without login
        const publicPages = [
          "/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ];

        const isPublicPage = publicPages.some((page) => {
          // Handle exact matches and paths with query parameters
          return (
            currentPath === page ||
            currentPath.startsWith(page + "/") ||
            (page === "/reset-password" && currentPath === "/reset-password")
          );
        });

        console.log(
          "401 interceptor - Current path:",
          fullPath,
          "Is public:",
          isPublicPage,
        );

        if (!isPublicPage) {
          // Only redirect if not already on a public page
          console.log("Redirecting to home due to 401 on protected page");
          sessionStorage?.setItem("justLoggedOut", "true");
          window.location.href = "/";
        } else {
          console.log("Staying on public page despite 401");
        }
      }
    }
    return Promise.reject(error);
  },
);
