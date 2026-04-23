// Reusable API Utility
window.API = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  try {
      const res = await fetch(`${window.API_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && token !== 'offline_mode_token' && { Authorization: `Bearer ${token}` })
        },
        ...options
      });

      // Handle non-OK status appropriately if needed, but fetch resolves unless network error.
      // We will parse the JSON even if status is not ok (e.g., 400 Bad Request) to get error messages.
      const json = await res.json();
      
      if (!res.ok) {
          throw new Error(json.message || 'API Error');
      }

      return json.data || json;
  } catch(e) {
      console.error(`[API Error] ${url}:`, e);
      throw e;
  }
};
