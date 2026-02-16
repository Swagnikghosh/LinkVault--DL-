const BASE_URL = import.meta.env.VITE_BACK_END_URL;

const swallowToJson = async (response, fallbackMessage) => {
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

export async function signupUser(name, email, password, confirmPassword) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  return swallowToJson(response, "Signup failed");
}

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return swallowToJson(response, "Login failed");
}

export async function logoutUser() {
  const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return swallowToJson(response, "Logout failed");
}

export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  return swallowToJson(response, "Failed to load user");
}

export async function changePassword(currentPassword, newPassword, confirmPassword) {
  const response = await fetch(`${BASE_URL}/api/v1/auth/changePassword`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  return swallowToJson(response, "Failed to change password");
}
