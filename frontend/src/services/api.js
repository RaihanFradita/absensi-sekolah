import { AUTH_TOKEN_KEY } from "../utils/constants";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function buildUrl(path, params) {
  const url = new URL(`${baseURL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }

  return url.toString();
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    headers = {},
  } = options;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const requestHeaders = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = {
      status: response.status,
      message:
        data?.message ||
        (response.status < 500
          ? "Permintaan tidak dapat diproses."
          : "Terjadi kesalahan pada server. Silakan coba lagi."),
      raw: import.meta.env.DEV ? data : undefined,
    };

    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    throw error;
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

const api = {
  get(path, options = {}) {
    return request(path, {
      method: "GET",
      params: options.params,
      headers: options.headers,
    });
  },

  post(path, body, options = {}) {
    return request(path, {
      method: "POST",
      body,
      headers: options.headers,
    });
  },

  put(path, body, options = {}) {
    return request(path, {
      method: "PUT",
      body,
      headers: options.headers,
    });
  },

  patch(path, body, options = {}) {
    return request(path, {
      method: "PATCH",
      body,
      headers: options.headers,
    });
  },

  delete(path, options = {}) {
    return request(path, {
      method: "DELETE",
      params: options.params,
      headers: options.headers,
    });
  },
};

let onUnauthorized = null;

export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export default api;