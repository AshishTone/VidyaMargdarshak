import api, { tokenStore } from "./api";

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  tokenStore.setTokens(data);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  tokenStore.setTokens(data);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout", { refreshToken: tokenStore.getRefreshToken() });
  } finally {
    tokenStore.clearTokens();
  }
}
