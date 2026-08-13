const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // If response is 204 No Content or empty
  if (response.status === 204) {
    return null;
  }

  // Handle errors
  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const data = await response.json();
      errorMsg = typeof data === "string" ? data : (data.message || errorMsg);
    } catch (e) {
      // If parsing fails, fall back to statusText
      try {
        const text = await response.text();
        errorMsg = text || response.statusText || errorMsg;
      } catch (_) {
        errorMsg = response.statusText || errorMsg;
      }
    }
    throw new Error(errorMsg);
  }

  // Check if response has content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};
