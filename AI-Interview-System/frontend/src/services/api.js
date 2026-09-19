const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const token = localStorage.getItem("ai_interview_token");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || "Request failed."
    );

    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return {
    data,
    status: response.status,
  };
};

const api = {
  get: (url, config = {}) =>
    request(url, {
      ...config,
      method: "GET",
    }),

  post: (url, body, config = {}) =>
    request(url, {
      ...config,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  put: (url, body, config = {}) =>
    request(url, {
      ...config,
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  delete: (url, config = {}) =>
    request(url, {
      ...config,
      method: "DELETE",
    }),
};

export default api;