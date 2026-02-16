const BASE_URL = import.meta.env.VITE_BACK_END_URL;

const readJsonOrError = async (response, fallbackMessage) => {
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

export async function getMyLinks() {
  const response = await fetch(`${BASE_URL}/api/v1/item/my-links`, {
    method: "GET",
    credentials: "include",
  });

  return readJsonOrError(response, "Failed to load links");
}

export async function updateMyLink(id, body) {
  const response = await fetch(`${BASE_URL}/api/v1/item/my-links/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return readJsonOrError(response, "Failed to update link");
}

export async function deleteMyLink(id) {
  const response = await fetch(`${BASE_URL}/api/v1/item/my-links/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return readJsonOrError(response, "Failed to delete link");
}
