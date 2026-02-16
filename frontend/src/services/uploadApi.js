const BASE_URL = import.meta.env.VITE_BACK_END_URL;

const consumeResponse = async (response, fallbackMessage) => {
  const responseText = await response.text();
  let message = fallbackMessage;

  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      message = parsed.message || fallbackMessage;
    } catch {
      message = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(message);
  }

  return responseText ? JSON.parse(responseText) : null;
};

const applyViewRules = (target, viewOnce, maxViews, asFormData = false) => {
  if (viewOnce) {
    if (asFormData) {
      target.append("maxViews", "1");
    } else {
      target.maxViews = 1;
    }
    return;
  }

  if (maxViews) {
    const parsed = Number(maxViews);
    if (asFormData) {
      target.append("maxViews", String(parsed));
    } else {
      target.maxViews = parsed;
    }
  }
};

export async function uploadText(text, expiresAt, password, viewOnce, maxViews, allowedViewerEmail, linkName) {
  const body = {
    item: text,
  };

  if (expiresAt) {
    body.expiresAt = expiresAt;
  }

  if (password) {
    body.password = password;
  }

  if (allowedViewerEmail?.trim()) {
    body.allowedViewerEmail = allowedViewerEmail.trim().toLowerCase();
  }
  if (linkName?.trim()) {
    body.linkName = linkName.trim();
  }

  applyViewRules(body, viewOnce, maxViews, false);

  const response = await fetch(`${BASE_URL}/api/v1/item/plainText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  return consumeResponse(response, "Text upload failed");
}

export async function uploadFile(file, expiresAt, password, viewOnce, maxViews, allowedViewerEmail, linkName) {
  const formData = new FormData();
  formData.append("file", file);
  if (expiresAt) {
    formData.append("expiresAt", expiresAt);
  }

  if (password) {
    formData.append("password", password);
  }

  if (allowedViewerEmail?.trim()) {
    formData.append("allowedViewerEmail", allowedViewerEmail.trim().toLowerCase());
  }
  if (linkName?.trim()) {
    formData.append("linkName", linkName.trim());
  }

  applyViewRules(formData, viewOnce, maxViews, true);

  const response = await fetch(`${BASE_URL}/api/v1/item/file`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return consumeResponse(response, "File upload failed");
}
