import axios from "axios";

export const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  // Ensure we don't have double slashes if baseUrl ends with / or path starts with /
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Enhanced fetch that automatically prepends the API URL and handles common options
 */
export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const url = getApiUrl(path);
    
  // Set default credentials to include cookies for auth
  if (options.credentials === undefined) {
    options.credentials = "include";
  }

  const response = await fetch(url, options);
  return response;
};

/**
 * Pre-configured Axios instance for the entire app
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

