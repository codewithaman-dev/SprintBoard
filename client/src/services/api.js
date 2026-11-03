const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload;
}

export const authApi = {
  register: (body) => api("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => api("/auth/logout", { method: "POST" }),
  me: () => api("/auth/me")
};

export const projectApi = {
  list: () => api("/projects"),
  create: (body) => api("/projects", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => api(`/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => api(`/projects/${id}`, { method: "DELETE" }),
  activities: (id) => api(`/projects/${id}/activities`)
};

export const issueApi = {
  list: (params = {}) => api(`/issues?${new URLSearchParams(params)}`),
  create: (body) => api("/issues", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => api(`/issues/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  changeStatus: (id, status) => api(`/issues/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  remove: (id) => api(`/issues/${id}`, { method: "DELETE" })
};

export const dashboardApi = {
  stats: () => api("/dashboard/stats")
};
