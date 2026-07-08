"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.ApiError = exports.auth = void 0;
const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "tunetrack_token";
exports.auth = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    clearToken: () => localStorage.removeItem(TOKEN_KEY),
};
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.ApiError = ApiError;
async function request(path, options = {}) {
    const token = exports.auth.getToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiError(body?.message ?? res.statusText, res.status);
    }
    if (res.status === 204)
        return undefined;
    return res.json();
}
exports.api = {
    register: (email, password) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
    login: (email, password) => request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
    artists: () => request("/artists"),
    albums: () => request("/albums"),
};
//# sourceMappingURL=api.js.map